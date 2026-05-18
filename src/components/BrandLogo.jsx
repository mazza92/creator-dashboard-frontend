import { useState } from 'react';
import styled from 'styled-components';

const Img = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
  image-rendering: -webkit-optimize-contrast;
`;

const Placeholder = styled.div`
  font-size: ${p => p.$small ? '12px' : '20px'};
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #0F0F0F;
`;

export default function BrandLogo({ brand, small = false }) {
  const [src, setSrc] = useState(
    brand.domain
      ? `https://logo.clearbit.com/${brand.domain}?size=200`
      : brand.logo_url || brand.logo || null
  );

  if (!src) {
    return (
      <Placeholder $small={small}>
        {brand.brand_name?.slice(0, small ? 3 : 5).toUpperCase() ||
         brand.name?.slice(0, small ? 3 : 5).toUpperCase() ||
         'BRAND'}
      </Placeholder>
    );
  }

  return (
    <Img
      src={src}
      alt={brand.brand_name || brand.name || 'Brand'}
      onError={() => {
        if (src.includes('clearbit') && (brand.logo_url || brand.logo)) {
          setSrc(brand.logo_url || brand.logo);
        } else {
          setSrc(null);
        }
      }}
    />
  );
}
