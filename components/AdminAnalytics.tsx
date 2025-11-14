import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import Icon from './Icons';
import { Role } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface AnalyticsData {
    totalSearches: number;
    totalTracked: number;
    topSchemes: { name: string; count: number }[];
    topStates: { name: string; count: number }[];
    topRoles: { name: Role; count: number }[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: string }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-6">
        <div className="bg-teal-100 dark:bg-teal-500/20 p-4 rounded-full">
            <Icon icon={icon} className="w-8 h-8 text-teal-500" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

const ListCard: React.FC<{ title: string; items: {name: string, count: number}[]; icon: string }> = ({ title, items, icon }) => {
    const { t } = useTranslation();
    return (
     <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Icon icon={icon} className="w-5 h-5 text-teal-500" />
            {title}
        </h3>
        {items.length > 0 ? (
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={item.name} className="flex justify-between items-center text-sm p-2 rounded-md bg-slate-50 dark:bg-slate-700/50">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{index + 1}. {item.name}</span>
                        <span className="font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded-full">{item.count}</span>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">{t('adminAnalyticsNoData')}</p>
        )}
    </div>
)};


const AdminAnalytics: React.FC = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const processData = async () => {
            setIsLoading(true);
            const rawData = await api.getAnalytics();

            const schemeCounts = rawData.tracked.reduce((acc, { schemeName }) => {
                acc[schemeName] = (acc[schemeName] || 0) + 1;
                return acc;
            }, {} as { [key: string]: number });

            const topSchemes = Object.entries(schemeCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            
            const stateCounts = rawData.searches.reduce((acc, { state }) => {
                acc[state] = (acc[state] || 0) + 1;
                return acc;
            }, {} as { [key: string]: number });

            const topStates = Object.entries(stateCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            
            const roleCounts = rawData.searches.reduce((acc, { role }) => {
                acc[role] = (acc[role] || 0) + 1;
                return acc;
            }, {} as { [key: string]: number });
            
            const topRoles = Object.entries(roleCounts)
                .map(([name, count]) => ({ name: name as Role, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);


            setData({
                totalSearches: rawData.searches.length,
                totalTracked: rawData.tracked.length,
                topSchemes,
                topStates,
                topRoles,
            });

            setIsLoading(false);
        };

        processData();
    }, []);

    if (isLoading) {
        return <div className="text-center p-8"><div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
    }

    if (!data) {
        return <p>Could not load analytics data.</p>;
    }

    return (
        <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title={t('adminAnalyticsTotalSearches')} value={data.totalSearches} icon="magnifying-glass" />
                <StatCard title={t('adminAnalyticsTotalTracked')} value={data.totalTracked} icon="document-text" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <ListCard title={t('adminAnalyticsMostTracked')} items={data.topSchemes} icon="star" />
                 <ListCard title={t('adminAnalyticsTopStates')} items={data.topStates} icon="map-pin" />
                 <ListCard title={t('adminAnalyticsTopRoles')} items={data.topRoles} icon="briefcase" />
            </div>
        </div>
    );
};

export default AdminAnalytics;