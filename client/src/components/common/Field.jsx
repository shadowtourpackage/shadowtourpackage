export default function Field({ label, error, ...props }) {
  return (
    <label>
      {label}
      <input {...props} />
      {error && <small style={{ color: '#e53e3e', display: 'block', marginTop: '4px' }}>{error}</small>}
    </label>
  );
}