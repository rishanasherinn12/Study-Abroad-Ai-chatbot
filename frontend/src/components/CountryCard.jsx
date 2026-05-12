export default function CountryCard({ flag, name, tagline, stat, onClick }) {
  return (
    <button className="country-card" onClick={onClick} type="button">
      <div className="country-flag" aria-hidden>{flag}</div>
      <div className="country-info">
        <h4>{name}</h4>
        <p>{tagline}</p>
      </div>
      <div className="country-stat">{stat}</div>
    </button>
  );
}
