import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { useTranslation } from 'react-i18next'; // 🎯 Engine Imported

const Results = ({ schemes, isLoading, onSaveScheme, onRemoveSavedScheme, isSavedView }) => {
    const { t, i18n } = useTranslation(); // 🎯 Engine Activated
    const currentLang = i18n.language; // Detects 'en', 'te', or 'hi'
    
    const [selectedScheme, setSelectedScheme] = useState(null);

    // 🎯 THE POLYGLOT EXTRACTOR
    const getTranslatedText = (scheme, field) => {
        if (!scheme) return '';
        // 1. If English, just give the base field
        if (currentLang === 'en') return scheme[field];
        
        // 2. Check the translation vault
        if (scheme.translations && scheme.translations[currentLang] && scheme.translations[currentLang][field]) {
            const translatedData = scheme.translations[currentLang][field];
            if (Array.isArray(translatedData) && translatedData.length > 0) return translatedData;
            if (typeof translatedData === 'string' && translatedData.trim() !== '') return translatedData;
        }
        
        // 3. Fallback to English
        return scheme[field];
    };

    const renderList = (data) => {
        if (!data) return <li>{t('res_not_specified')}</li>;
        if (Array.isArray(data)) {
            if (data.length === 0) return <li>{t('res_not_specified')}</li>;
            return data.map((item, i) => <li key={i}>{item}</li>);
        }
        if (typeof data === 'string') {
            return <li>{data}</li>;
        }
        return <li>{t('res_not_specified')}</li>;
    };

    // 🎯 THE UPGRADED, ASYNC PDF GENERATOR
    const handleDownloadPDF = async (scheme, e) => {
        e.stopPropagation(); 
        
        const doc = new jsPDF();

        try {
            // --- 🌐 FONT INJECTION ENGINE ---
            if (currentLang === 'te') {
                const fontBytes = await fetch('/fonts/NotoSansTelugu-Regular.ttf').then(res => res.arrayBuffer());
                const base64String = btoa(new Uint8Array(fontBytes).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                doc.addFileToVFS('NotoSansTelugu.ttf', base64String);
                doc.addFont('NotoSansTelugu.ttf', 'TeluguFont', 'normal');
                doc.setFont('TeluguFont');
            } else if (currentLang === 'hi') {
                const fontBytes = await fetch('/fonts/NotoSansDevanagari-Regular.ttf').then(res => res.arrayBuffer());
                const base64String = btoa(new Uint8Array(fontBytes).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                doc.addFileToVFS('NotoSansDevanagari.ttf', base64String);
                doc.addFont('NotoSansDevanagari.ttf', 'HindiFont', 'normal');
                doc.setFont('HindiFont');
            } else {
                doc.setFont('helvetica');
            }
        } catch (error) {
            console.error("Font Loading Error:", error);
            alert("Failed to load language fonts. PDF may generate with missing characters.");
        }

        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        let currentY = margin;

        const checkPageBreak = (requiredSpace) => {
            if (currentY + requiredSpace >= pageHeight - margin) {
                doc.addPage();
                currentY = margin;
            }
        };

        // --- DRAWING THE PDF ---
        doc.setFontSize(20);
        doc.setTextColor(30, 58, 138); 
        const titleLines = doc.splitTextToSize(getTranslatedText(scheme, 'name') || t('res_unnamed'), 170);
        doc.text(titleLines, margin, currentY);
        currentY += (titleLines.length * 10);
        
        checkPageBreak(20);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`${t('res_category')}: ${getTranslatedText(scheme, 'category') || t('res_general')} | ${t('res_state')}: ${getTranslatedText(scheme, 'state') || t('res_all_india')}`, margin, currentY);
        
        currentY += 8;
        doc.setDrawColor(200);
        doc.line(margin, currentY, 190, currentY);
        currentY += 12;
        
        checkPageBreak(15);
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(t('res_desc_elig') + ":", margin, currentY);
        currentY += 8;
        
        doc.setFontSize(11);
        doc.setTextColor(80);
        const descText = getTranslatedText(scheme, 'description') || t('res_no_details');
        const descLines = doc.splitTextToSize(descText, 170);
        
        descLines.forEach(line => {
            checkPageBreak(7);
            doc.text(line, margin, currentY);
            currentY += 7;
        });
        currentY += 5; 
        
        const extractedDocs = getTranslatedText(scheme, 'requiredDocs');
        if (extractedDocs && extractedDocs.length > 0) {
            checkPageBreak(15);
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text(t('res_req_docs') + ":", margin, currentY);
            currentY += 8;
            
            doc.setFontSize(11);
            doc.setTextColor(80);
            
            const docsArray = Array.isArray(extractedDocs) ? extractedDocs : [extractedDocs];
            docsArray.forEach((docItem) => {
                if(typeof docItem === 'string') {
                    const docLines = doc.splitTextToSize(`• ${docItem}`, 170);
                    docLines.forEach(line => {
                        checkPageBreak(7);
                        doc.text(line, margin, currentY);
                        currentY += 7;
                    });
                }
            });
            currentY += 5;
        }

        const extractedSteps = getTranslatedText(scheme, 'applicationSteps');
        if (extractedSteps && extractedSteps.length > 0) {
            checkPageBreak(15);
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text(t('res_app_steps') + ":", margin, currentY);
            currentY += 8;
            
            doc.setFontSize(11);
            doc.setTextColor(80);
            
            const stepsArray = Array.isArray(extractedSteps) ? extractedSteps : [extractedSteps];
            stepsArray.forEach((step, index) => {
                if(typeof step === 'string') {
                    const stepLines = doc.splitTextToSize(`${index + 1}. ${step}`, 170);
                    stepLines.forEach(line => {
                        checkPageBreak(7);
                        doc.text(line, margin, currentY);
                        currentY += 7;
                    });
                }
            });
        }
        
        const safeFileName = (scheme.name || 'Scheme').substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
        doc.save(`${safeFileName}_Guide.pdf`);
    };

    const handleSaveClick = (scheme, e) => {
        e.stopPropagation(); 
        if (onSaveScheme) onSaveScheme(scheme);
    };

    const handleRemoveClick = (schemeId, e) => {
        e.stopPropagation();
        if (onRemoveSavedScheme) onRemoveSavedScheme(schemeId);
        if (selectedScheme && (selectedScheme._id === schemeId || selectedScheme.id === schemeId)) {
            setSelectedScheme(null); 
        }
    };

    const formatIncome = (income) => {
        if (!income || income === 99999999) return t('res_no_limit');
        return `${t('res_under')} ₹${Number(income).toLocaleString('en-IN')}`;
    };

    const safeSchemes = Array.isArray(schemes) ? schemes : [];

    if (isLoading) {
        return (
            <div className="bg-white p-10 rounded-xl shadow-md text-center border border-gray-100 mt-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-blue-600">{t('res_loading')}</h3>
            </div>
        );
    }

    return (
        <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                {isSavedView ? t('res_saved_title') : t('res_matched_title')} ({safeSchemes.length})
            </h2>
            
            {safeSchemes.length === 0 ? (
                <div className="bg-white p-10 rounded-xl shadow-md text-center border border-gray-100">
                    <p className="text-gray-500 text-lg">
                        {isSavedView ? t('res_no_saved') : t('res_no_matched')}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {safeSchemes.map((scheme) => {
                        const schemeId = scheme._id || scheme.id || Math.random().toString();
                        
                        return (
                        <div 
                            key={schemeId} 
                            onClick={() => setSelectedScheme(scheme)}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col h-full"
                        >
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                                {/* 🎯 Extract Dynamic Name */}
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-3 line-clamp-2">
                                    {getTranslatedText(scheme, 'name') || t('res_unnamed')}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{getTranslatedText(scheme, 'category') || t('res_general')}</span>
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">{getTranslatedText(scheme, 'state') || t('res_all_india')}</span>
                                </div>
                            </div>

                            <div className="p-6 flex-grow flex flex-col justify-between">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm mb-4">
                                    <p className="text-gray-700"><strong>{t('res_age_limit')}:</strong> {scheme.rules?.minAge || 0} - {scheme.rules?.maxAge || 100} {t('res_yrs')}</p>
                                    <p className="text-gray-700"><strong>{t('res_income_limit')}:</strong> {formatIncome(scheme.rules?.incomeLimit)}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                {isSavedView ? (
                                    <button onClick={(e) => handleRemoveClick(schemeId, e)} className="text-red-600 hover:text-red-800 font-semibold text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        {t('res_remove_saved')}
                                    </button>
                                ) : (
                                    <button onClick={(e) => handleSaveClick(scheme, e)} className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21z"></path></svg>
                                        {t('res_save_later')}
                                    </button>
                                )}
                                <span className="text-blue-600 font-semibold group-hover:underline text-sm">{t('res_view_details')} ↗</span>
                            </div>
                        </div>
                    )})}
                </div>
            )}

            {/* --- MODAL POPUP --- */}
            {selectedScheme && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setSelectedScheme(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-blue-900 p-6 flex justify-between items-start text-white">
                            <div>
                                {/* 🎯 Extract Dynamic Name */}
                                <h2 className="text-2xl font-bold mb-2">{getTranslatedText(selectedScheme, 'name')}</h2>
                                <div className="flex gap-3 text-sm font-medium">
                                    <span className="bg-blue-800 px-3 py-1 rounded-full border border-blue-700">{getTranslatedText(selectedScheme, 'category') || selectedScheme.category}</span>
                                    <span className="bg-blue-800 px-3 py-1 rounded-full border border-blue-700">{getTranslatedText(selectedScheme, 'state') || selectedScheme.state}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedScheme(null)} className="text-blue-200 hover:text-white text-3xl leading-none">&times;</button>
                        </div>

                        <div className="p-8 overflow-y-auto bg-gray-50 flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">{t('res_desc_elig')}</h3>
                                    {/* 🎯 Extract Dynamic Description */}
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{getTranslatedText(selectedScheme, 'description')}</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">{t('res_app_steps')}</h3>
                                    <ul className="list-decimal list-inside space-y-2 text-gray-700">
                                        {/* 🎯 Extract Dynamic App Steps */}
                                        {renderList(getTranslatedText(selectedScheme, 'applicationSteps'))}
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-2">
                                    <h3 className="text-lg font-bold text-blue-900 border-b border-blue-200 pb-2 mb-4">{t('res_req_docs')}</h3>
                                    <ul className="list-disc list-inside space-y-2 text-blue-800 text-sm">
                                        {/* 🎯 Extract Dynamic Required Docs */}
                                        {renderList(getTranslatedText(selectedScheme, 'requiredDocs'))}
                                    </ul>
                                </div>
                                
                                {isSavedView ? (
                                    <button onClick={(e) => handleRemoveClick(selectedScheme._id || selectedScheme.id, e)} className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 px-6 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2">
                                        {t('res_remove_from_saved')}
                                    </button>
                                ) : (
                                    <button onClick={(e) => handleSaveClick(selectedScheme, e)} className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold py-3 px-6 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2">
                                        {t('res_save_this')}
                                    </button>
                                )}

                                <button onClick={(e) => handleDownloadPDF(selectedScheme, e)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
                                    {t('res_download_pdf')}
                                </button>

                                {selectedScheme.link && (
                                    <a href={selectedScheme.link} target="_blank" rel="noreferrer" className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 block text-center">
                                        {t('res_visit_portal')} ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Results;