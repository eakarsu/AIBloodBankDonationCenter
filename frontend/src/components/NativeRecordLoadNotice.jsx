import React from 'react';
export default function NativeRecordLoadNotice({ error, onRetry }) {
  if (!error) return null;
  return <div className="error-message" role="alert"><p>{error}</p><button type="button" className="btn btn-secondary" onClick={onRetry}>Retry loading records</button></div>;
}
