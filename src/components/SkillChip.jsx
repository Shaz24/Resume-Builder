import React from 'react';

export default function SkillChip({ skill, onRemove }) {
  return (
    <span className="skill-chip">
      {skill}
      {onRemove && (
        <button className="skill-chip-remove" onClick={() => onRemove(skill)} title="Remove">×</button>
      )}
    </span>
  );
}

export function SkillInput({ skills, onChange }) {
  const [input, setInput] = React.useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput('');
  };

  const remove = (skill) => onChange(skills.filter(s => s !== skill));

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="form-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a skill and press Enter (e.g. React, Python)"
          style={{ flex: 1 }}
        />
        <button className="btn btn-secondary btn-sm" onClick={add} type="button">Add</button>
      </div>
      <div className="skill-chips-wrap">
        {skills.map(s => <SkillChip key={s} skill={s} onRemove={remove} />)}
      </div>
    </div>
  );
}
