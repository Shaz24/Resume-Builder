import React from 'react';

export default function ModernTemplate({ data, editable, onEdit }) {
  if (!data) return null;
  const { summary, education: edu, skills, projects, internships, achievements, certifications } = data;

  const sidebarStyle = {
    width: '34%', background: '#1e1b4b', color: '#e8e0ff',
    padding: '16px 14px', fontSize: '9.5pt',
  };
  const mainStyle = { flex: 1, padding: '16px 14px', fontSize: '10pt', color: '#1a1a1a' };
  const sideSecTitle = {
    fontSize: '10pt', fontWeight: 700, color: '#d2bbff',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    marginTop: 16, marginBottom: 8, paddingBottom: 4,
    borderBottom: '1px solid rgba(255,255,255,0.15)',
  };
  const mainSecTitle = {
    fontSize: '11pt', fontWeight: 700, color: '#7c3aed',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    marginTop: 14, marginBottom: 8, paddingBottom: 4,
    borderBottom: '2px solid #7c3aed',
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', Arial, sans-serif", display: 'flex', minHeight: '297mm', background: '#fff' }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        {/* Name block */}
        <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ fontSize: '16pt', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
            {data.fullName || 'Your Name'}
          </div>
          <div style={{ fontSize: '10pt', color: '#d2bbff', fontWeight: 600 }}>
            {data.targetRole || 'Software Engineer'}
          </div>
        </div>

        {/* Contact */}
        <div style={sideSecTitle}>Contact</div>
        {data.email && <div style={{ marginBottom: 6, wordBreak: 'break-all' }}>📧 {data.email}</div>}
        {data.phone && <div style={{ marginBottom: 6 }}>📱 {data.phone}</div>}
        {data.linkedinUrl && <div style={{ marginBottom: 6, wordBreak: 'break-all' }}>🔗 {data.linkedinUrl}</div>}
        {data.githubUrl && <div style={{ marginBottom: 6, wordBreak: 'break-all' }}>💻 {data.githubUrl}</div>}

        {/* Skills */}
        {skills?.length > 0 && (
          <>
            <div style={sideSecTitle}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {skills.map((s, i) => (
                <span key={i} style={{
                  padding: '2px 8px', background: 'rgba(210,187,255,0.15)',
                  border: '1px solid rgba(210,187,255,0.3)', borderRadius: 20,
                  fontSize: '8.5pt', color: '#d2bbff',
                }}>{s}</span>
              ))}
            </div>
          </>
        )}

        {/* Certifications */}
        {certifications?.length > 0 && (
          <>
            <div style={sideSecTitle}>Certifications</div>
            {certifications.map((c, i) => (
              <div key={i} style={{ marginBottom: 4, fontSize: '9pt' }}>✦ {c}</div>
            ))}
          </>
        )}

        {/* Education in sidebar */}
        {edu && (
          <>
            <div style={sideSecTitle}>Education</div>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: 2 }}>{edu.college}</div>
            <div style={{ fontSize: '9pt' }}>{edu.degree}</div>
            <div style={{ fontSize: '9pt' }}>{edu.branch}</div>
            <div style={{ fontSize: '9pt', color: '#d2bbff', marginTop: 4 }}>
              {edu.year}{edu.cgpa ? ` · CGPA ${edu.cgpa}` : ''}
            </div>
          </>
        )}
      </div>

      {/* Main */}
      <div style={mainStyle}>
        {/* Summary */}
        {summary && (
          <>
            <div style={mainSecTitle}>Profile</div>
            <div style={{ color: '#333', lineHeight: 1.5 }}>{summary}</div>
          </>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <>
            <div style={mainSecTitle}>Projects</div>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#0f0f0f' }}>{p.title}</span>
                  {p.liveLink && <span style={{ fontSize: '8.5pt', color: '#0566d9' }}>{p.liveLink}</span>}
                </div>
                <div style={{ fontSize: '9pt', color: '#7c3aed', fontWeight: 600, marginBottom: 2 }}>
                  {Array.isArray(p.techStack) ? p.techStack.join(' · ') : p.techStack}
                </div>
                <div style={{ color: '#444', fontSize: '9.5pt', lineHeight: 1.4 }}>{p.description}</div>
              </div>
            ))}
          </>
        )}

        {/* Internships */}
        {internships?.length > 0 && (
          <>
            <div style={mainSecTitle}>Experience</div>
            {internships.map((intern, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>{intern.role}</span>
                  <span style={{ fontSize: '9pt', color: '#666' }}>{intern.duration}</span>
                </div>
                <div style={{ fontSize: '9.5pt', color: '#7c3aed', marginBottom: 4 }}>{intern.company}</div>
                {intern.achievements?.map
                  ? intern.achievements.map((a, j) => <div key={j} style={{ fontSize: '9.5pt', color: '#444', marginTop: 2 }}>• {a}</div>)
                  : <div style={{ fontSize: '9.5pt', color: '#444' }}>• {intern.achievements}</div>
                }
              </div>
            ))}
          </>
        )}

        {/* Achievements */}
        {achievements?.length > 0 && (
          <>
            <div style={mainSecTitle}>Achievements</div>
            {Array.isArray(achievements)
              ? achievements.map((a, i) => <div key={i} style={{ fontSize: '9.5pt', color: '#444', marginTop: 3 }}>▸ {a}</div>)
              : achievements.split('\n').filter(Boolean).map((a, i) => <div key={i} style={{ fontSize: '9.5pt', color: '#444', marginTop: 3 }}>▸ {a}</div>)
            }
          </>
        )}
      </div>
    </div>
  );
}
