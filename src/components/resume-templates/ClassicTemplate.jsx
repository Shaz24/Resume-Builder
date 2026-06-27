import React from 'react';

const S = {
  page: {
    background: '#fff', color: '#1a1a1a',
    fontFamily: "'Plus Jakarta Sans', 'Arial', sans-serif",
    fontSize: '10.5pt', lineHeight: 1.45, padding: '14mm 12mm',
  },
  header: { textAlign: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #7c3aed' },
  name: { fontSize: '22pt', fontWeight: 800, color: '#0f0f0f', letterSpacing: '-0.5px', marginBottom: 4 },
  contact: { fontSize: '9pt', color: '#555', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' },
  contactItem: { display: 'flex', alignItems: 'center', gap: 3 },
  sectionTitle: {
    fontSize: '11pt', fontWeight: 700, color: '#7c3aed',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    borderBottom: '1px solid #e8e0ff', paddingBottom: 4,
    marginTop: 14, marginBottom: 8,
  },
  summary: { color: '#333', fontSize: '10pt', lineHeight: 1.5 },
  skillChips: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  skillChip: {
    padding: '2px 10px', background: '#f0ebff',
    border: '1px solid #d2bbff', borderRadius: 20,
    fontSize: '9pt', color: '#5b21b6', fontWeight: 600,
  },
  projectTitle: { fontWeight: 700, color: '#1a1a1a', fontSize: '10.5pt' },
  projectMeta: { fontSize: '9pt', color: '#7c3aed', fontWeight: 600 },
  projectDesc: { fontSize: '9.5pt', color: '#444', marginTop: 3, lineHeight: 1.4 },
  bullet: { fontSize: '9.5pt', color: '#444', marginTop: 2 },
  companyName: { fontWeight: 700, fontSize: '10.5pt' },
  roleText: { fontSize: '9.5pt', color: '#555', fontStyle: 'italic' },
  edRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cgpa: { fontWeight: 700, color: '#7c3aed' },
};

export default function ClassicTemplate({ data, editable, onEdit }) {
  if (!data) return null;
  const { summary, education: edu, skills, projects, internships, achievements, certifications } = data;

  const maybeEditable = (content, field) =>
    editable
      ? <span contentEditable suppressContentEditableWarning
              onBlur={e => onEdit?.(field, e.target.innerText)}
              style={{ outline: 'none', cursor: 'text' }}
              className="inline-editable">{content}</span>
      : content;

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.name}>{maybeEditable(data.fullName || 'Your Name', 'fullName')}</div>
        <div style={{ fontSize: '11pt', color: '#7c3aed', fontWeight: 600, marginBottom: 6 }}>
          {maybeEditable(data.targetRole || 'Software Engineer', 'targetRole')}
        </div>
        <div style={S.contact}>
          {data.email && <span style={S.contactItem}>📧 {data.email}</span>}
          {data.phone && <span style={S.contactItem}>📱 {data.phone}</span>}
          {data.linkedinUrl && <span style={S.contactItem}>🔗 {data.linkedinUrl}</span>}
          {data.githubUrl && <span style={S.contactItem}>💻 {data.githubUrl}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <>
          <div style={S.sectionTitle}>Professional Summary</div>
          <div style={S.summary}>{maybeEditable(summary, 'summary')}</div>
        </>
      )}

      {/* Education */}
      {edu && (
        <>
          <div style={S.sectionTitle}>Education</div>
          <div style={S.edRow}>
            <div>
              <div style={S.companyName}>{edu.college}</div>
              <div style={S.roleText}>{edu.degree} in {edu.branch}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '9.5pt', color: '#555' }}>{edu.year}</div>
              {edu.cgpa && <div style={S.cgpa}>CGPA: {edu.cgpa}</div>}
            </div>
          </div>
        </>
      )}

      {/* Skills */}
      {skills?.length > 0 && (
        <>
          <div style={S.sectionTitle}>Technical Skills</div>
          <div style={S.skillChips}>
            {skills.map((s, i) => <span key={i} style={S.skillChip}>{s}</span>)}
          </div>
        </>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <>
          <div style={S.sectionTitle}>Projects</div>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={S.projectTitle}>{p.title}</span>
                {p.liveLink && <span style={{ fontSize: '8.5pt', color: '#0566d9' }}>{p.liveLink}</span>}
              </div>
              <div style={S.projectMeta}>
                {Array.isArray(p.techStack) ? p.techStack.join(' · ') : p.techStack}
              </div>
              <div style={S.projectDesc}>{p.description}</div>
            </div>
          ))}
        </>
      )}

      {/* Internships */}
      {internships?.length > 0 && (
        <>
          <div style={S.sectionTitle}>Experience</div>
          {internships.map((intern, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={S.edRow}>
                <div>
                  <div style={S.companyName}>{intern.role} — {intern.company}</div>
                </div>
                <div style={{ fontSize: '9.5pt', color: '#555' }}>{intern.duration}</div>
              </div>
              {intern.achievements?.map
                ? intern.achievements.map((a, j) => <div key={j} style={S.bullet}>• {a}</div>)
                : <div style={S.bullet}>• {intern.achievements}</div>
              }
            </div>
          ))}
        </>
      )}

      {/* Certifications */}
      {certifications?.length > 0 && (
        <>
          <div style={S.sectionTitle}>Certifications</div>
          {certifications.map((c, i) => <div key={i} style={S.bullet}>• {c}</div>)}
        </>
      )}

      {/* Achievements */}
      {achievements?.length > 0 && (
        <>
          <div style={S.sectionTitle}>Achievements</div>
          {Array.isArray(achievements)
            ? achievements.map((a, i) => <div key={i} style={S.bullet}>• {a}</div>)
            : achievements.split('\n').filter(Boolean).map((a, i) => <div key={i} style={S.bullet}>• {a}</div>)
          }
        </>
      )}
    </div>
  );
}
