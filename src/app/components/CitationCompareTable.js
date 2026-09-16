import React from 'react';
import { CITATION_COMPARISON, CITATION_LAST_UPDATED } from '../../lib/citationFacts';

export default function CitationCompareTable({ tone = 'light' }) {
  const dark = tone === 'dark';
  const ink = dark ? '#ffffff' : '#15161a';
  const muted = dark ? '#c7c9d0' : '#6b6f78';
  const line = dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb';
  const head = dark ? 'rgba(255,255,255,0.06)' : '#f7f7f8';
  const us = dark ? '#ffffff' : '#15161a';

  return (
    <div style={{ overflowX: 'auto', marginTop: 28, border: `1px solid ${line}`, borderRadius: 16 }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 14,
          color: ink,
        }}
      >
        <caption style={{ captionSide: 'bottom', textAlign: 'left', padding: '12px 16px', fontSize: 12, color: muted, lineHeight: 1.45 }}>
          Comparison last updated {CITATION_LAST_UPDATED}. {CITATION_COMPARISON.source}
        </caption>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '14px 16px', background: head, borderBottom: `1px solid ${line}` }}> </th>
            {CITATION_COMPARISON.columns.map((col) => (
              <th
                key={col}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  background: head,
                  borderBottom: `1px solid ${line}`,
                  fontWeight: col === 'Newcollab' ? 700 : 600,
                  color: col === 'Newcollab' ? us : ink,
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CITATION_COMPARISON.rows.map((row) => (
            <tr key={row.label}>
              <td style={{ padding: '14px 16px', borderBottom: `1px solid ${line}`, fontWeight: 600 }}>{row.label}</td>
              {row.cells.map((cell, i) => (
                <td
                  key={`${row.label}-${i}`}
                  style={{
                    padding: '14px 16px',
                    borderBottom: `1px solid ${line}`,
                    fontWeight: i === row.cells.length - 1 ? 600 : 400,
                    verticalAlign: 'top',
                    lineHeight: 1.45,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
