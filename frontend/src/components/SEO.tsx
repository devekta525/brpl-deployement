import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { getSeoMetaByPath } from '@/apihelper/seo';
import { buildBreadcrumbSchema } from '@/components/SchemaMarkup';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    /** Override the last breadcrumb item name (e.g. blog post title, news title) */
    breadcrumbCurrentName?: string;
}

const SEO = ({ title, description, keywords, image, url, breadcrumbCurrentName }: SEOProps) => {
    const siteTitle = 'Beyond Reach Premier League';

    const [dynamicTitle, setDynamicTitle] = useState(`${title} | ${siteTitle}`);
    const [dynamicDesc, setDynamicDesc] = useState(description);
    const [dynamicKeywords, setDynamicKeywords] = useState(keywords || '');
    const [ogTitle, setOgTitle] = useState<string | null>(null);
    const [ogDescription, setOgDescription] = useState<string | null>(null);
    const [ogImage, setOgImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchSEO = async () => {
            try {
                const path = window.location.pathname;
                const data = await getSeoMetaByPath(path);

                if (data && data.title) {
                    setDynamicTitle(data.title.includes(siteTitle) ? data.title : `${data.title} | ${siteTitle}`);
                    if (data.description) setDynamicDesc(data.description);
                    if (data.keywords) setDynamicKeywords(data.keywords);
                    setOgTitle(data.ogTitle?.trim() || null);
                    setOgDescription(data.ogDescription?.trim() || null);
                    setOgImage(data.ogImage?.trim() || null);
                } else {
                    setDynamicTitle(`${title} | ${siteTitle}`);
                    setDynamicDesc(description);
                    setDynamicKeywords(keywords || '');
                    setOgTitle(null);
                    setOgDescription(null);
                    setOgImage(null);
                }
            } catch {
                setDynamicTitle(`${title} | ${siteTitle}`);
                setDynamicDesc(description);
                setDynamicKeywords(keywords || '');
                setOgTitle(null);
                setOgDescription(null);
                setOgImage(null);
            }
        };

        fetchSEO();
    }, [title, description, keywords]);

    const defaultImage = typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '/logo.png';
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const breadcrumbSchema = buildBreadcrumbSchema(pathname, breadcrumbCurrentName);

    const finalOgTitle = ogTitle ?? dynamicTitle;
    const finalOgDescription = ogDescription ?? dynamicDesc;
    const finalOgImage = ogImage ?? image ?? defaultImage;

    return (
        <Helmet>
            <title>{dynamicTitle}</title>
            <meta name="description" content={dynamicDesc} />
            {dynamicKeywords && <meta name="keywords" content={dynamicKeywords} />}
            <link rel="canonical" href={currentUrl} />

            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={finalOgTitle} />
            <meta property="og:description" content={finalOgDescription} />
            <meta property="og:image" content={finalOgImage.startsWith('http') ? finalOgImage : `${typeof window !== 'undefined' ? window.location.origin : ''}${finalOgImage}`} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={currentUrl} />
            <meta name="twitter:title" content={finalOgTitle} />
            <meta name="twitter:description" content={finalOgDescription} />
            <meta name="twitter:image" content={finalOgImage.startsWith('http') ? finalOgImage : `${typeof window !== 'undefined' ? window.location.origin : ''}${finalOgImage}`} />

            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        </Helmet>
    );
};

export default SEO;
