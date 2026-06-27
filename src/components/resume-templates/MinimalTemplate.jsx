import React from 'react';

export default function MinimalTemplate({ data, editable, onEdit }) {
  if (!data) return null;
  const { summary, education: edu, skills, projects, internships, achievements, certifications } = data;

  const pg = { fontFamily: "'Plus Jakarta Sans', Arial, sans-serif", background: '#fff', color: '#111', padding: '14mm 16mm', fontSize: '10pt', lineHeight: 1.4 };
  const sec = { marginTop: 14, paddingTop: 10, borderTop: '1px solid #e5e5e5' };
  const secTitle = { fontSize: '9pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', marginBottom: 8 };
  const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' };
  const strong = { fontWeight: 700, color: '#0a0a0a' };
  const sub = { fontSize: '9.5pt', color: '#555' };
  const bullet = { fontSize: '9.5pt', color: '#333', marginTop: 2 };

  return (
    <div style={pg}>
      {/* Name */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: '24pt', fontWeight: 800, letterSpacing: '-1px', color: '#0a0a0a', marginBottom: 2 }}>
          {data.fullName || 'Your Name'}
        </div>
        <div style={{ fontSize: '11pt', color: '#666', fontWeight: 500 }}>{data.targetRole}</div>
        <div style={{ fontSize: '9pt', color: '#888', marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.linkedinUrl && <span>{data.linkedinUrl}</span>}
          {data.githubUrl && <span>{data.githubUrl}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={sec}>
          <div style={secTitle}>Summary</div>
          <div style={{ color: '#444', lineHeight: 1.55, fontSize: '9.5pt' }}>{summary}</div>
        </div>
      )}

      {/* Skills */}
      {skills?.length > 0 && (
        <div style={sec}>
          <div style={secTitle}>Skills</div>
          <div style={{ color: '#333', fontSize: '9.5pt' }}>{skills.join(' · ')}</div>
        </div>
      )}

      {/* Education */}
      {edu && (
        <div style={sec}>
          <div style={secTitle}>Education</div>
          <div style={row}>
            <div>
              <div style={strong}>{edu.college}</div>
              <div style={sub}>{edu.degree} — {edu.branch}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={sub}>{edu.year}</div>
              {edu.cgpa && <div style={{ ...strong, fontSize: '9.5pt' }}>CGPA {edu.cgpa}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Experience */}
      {internships?.length > 0 && (
        <div style={sec}>
          <div style={secTitle}>Experience</div>
          {internships.map((intern, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={row}>
                <div style={strong}>{intern.role} — {intern.company}</div>
                <div style={sub}>{intern.duration}</div>
              </div>
              {intern.achievements?.map
                ? intern.achievements.map((a, j) => <div key={j} style={bullet}>— {a}</div>)
                : <div style={bullet}>— {intern.achievements}</div>
              }
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <div style={sec}>
          <div style={secTitle}>Projects</div>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={row}>
                <span style={strong}>{p.title}</span>
                {p.liveLink && <span style={{ fontSize: '8.5pt', color: '#0566d9' }}>{p.liveLink}</span>}
              </div>
              <div style={{ ...sub, marginBottom: 2 }}>
                {Array.isArray(p.techStack) ? p.techStack.join(', ') : p.techStack}
              </div>
              <div style={bullet}>{p.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications?.length > 0 && (
        <div style={sec}>
          <div style={secTitle}>Certifications</div>
          <div style={sub}>{certifications.join(' · ')}</div>
        </div>
      )}

      {/* Achievements */}
      {achievements?.length > 0 && (
        <div style={sec}>
          <div style={secTitle}>Achievements</div>
          {Array.isArray(achievements)
            ? achievements.map((a, i) => <div key={i} style={bullet}>— {a}</div>)
            : achievements.split('\n').filter(Boolean).map((a, i) => <div key={i} style={bullet}>— {a}</div>)
          }
        </div>
      )}
    </div>
  );
}
