import React from 'react';

interface Business {
    name: string;
    image: string;
    description: string;
    address: {
        streetAddress: string;
        district: string;
        postalCode: string;
    };
    telephone: string;
    url: string;
    geo: {
        latitude: string;
        longitude: string;
    };
    areaServed: string;
    category: string;
    aggregateRating?: {
        ratingValue: string;
        reviewCount: string;
    };
}

export const BusinessSchema: React.FC<{ business: Business }> = ({ business }) => {
    const schema = {
        '@context': 'https://schema.org/',
        '@type': 'LocalBusiness',
        name: business.name,
        image: business.image,
        description: business.description,
        address: {
            '@type': 'PostalAddress',
            streetAddress: business.address.streetAddress,
            addressLocality: business.address.district,
            addressRegion: 'Lima',
            postalCode: business.address.postalCode,
            addressCountry: 'PE',
        },
        telephone: business.telephone,
        url: business.url,
        geo: {
            '@type': 'GeoCoordinates',
            latitude: business.geo.latitude,
            longitude: business.geo.longitude,
        },
        areaServed: business.areaServed,
        category: business.category,
        aggregateRating: business.aggregateRating ? {
            '@type': 'AggregateRating',
            ratingValue: business.aggregateRating.ratingValue,
            reviewCount: business.aggregateRating.reviewCount,
        } : undefined,
    };

    return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
};