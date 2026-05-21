import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Heart, Shield, Brain, Star, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import './Landing.css';
import BookingSection from '../components/BookingSection';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <span className="psi-symbol-nav">Ψ</span>
          <span className="nav-name">Ana Paula Candido</span>
        </div>
        <div className="nav-links">
          <a href="#especialidades">Especialidades</a>
          <a href="#sobre">Sobre Mim</a>
          <a href="#avaliacoes">Avaliações</a>
          <a href="#agendar">Agendar</a>
          <button className="btn-login-link" onClick={() => navigate('/login')}>
            Área Profissional
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero-section">
        <div className="hero-background-image"></div>
        
        <div className="hero-particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="hero-particle" style={{
              width: `${20 + i * 15}px`,
              height: `${20 + i * 15}px`,
              top: `${10 + i * 11}%`,
              left: `${5 + i * 12}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${5 + i}s`
            }} />
          ))}
        </div>

        <motion.div className="hero-glow" animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 6, repeat: Infinity }} />
        <div className="hero-glow-2"></div>
        <div className="wave-animation"></div>
        <div className="wave-animation wave-animation-2"></div>

        <div className="hero-content">
          <motion.div className="hero-text-content" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeInUp} className="hero-badge">
              ✦ CRP 06/157985 • Psicologia Clínica
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="hero-title">
              Dra. Ana Paula<br />
              <span>Candido</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="hero-subtitle">
              Psicóloga Clínica
            </motion.p>
            
            <motion.p variants={fadeInUp} className="hero-description">
              Acolhimento genuíno, escuta ativa e transformação. Um espaço seguro 
              e profissional para iniciar sua jornada de autoconhecimento e bem-estar emocional.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="hero-buttons">
              <a href="#agendar" className="btn-accent">
                Agendar Consulta <ArrowRight size={18} />
              </a>
              <a href="#sobre" className="btn-ghost">
                Saiba mais
              </a>
            </motion.div>

            <motion.div variants={fadeInUp} className="hero-stats">
              {[
                { number: '5★', label: 'Avaliação Google' },
                { number: '100%', label: 'Confidencial' },
                { number: 'Online', label: 'e Presencial' }
              ].map((s, i) => (
                <div key={i} className="hero-stat">
                  <div className="hero-stat-number">{s.number}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="hero-card-float">
              <span className="hero-card-psi">Ψ</span>
              <div className="hero-card-name">Ana Paula Candido</div>
              <div className="hero-card-crp">CRP 06/157985</div>
              <div className="hero-card-divider" />
              <div className="hero-card-tags">
                {['Psicoterapia', 'Ansiedade', 'Casal', 'Autoconhecimento'].map(t => (
                  <span key={t} className="hero-card-tag">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Especialidades */}
      <section id="especialidades" className="services-section">
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="section-tag">✦ Especialidades</div>
            <h2>Áreas de Atuação</h2>
            <div className="divider"></div>
            <p>Atendimentos personalizados para cada etapa da sua jornada emocional</p>
          </motion.div>

          <motion.div className="services-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            {[
              { icon: <Brain size={28} />, title: 'Psicoterapia Individual', desc: 'Espaço confidencial para explorar emoções, pensamentos e comportamentos. Desenvolvimento pessoal profundo.' },
              { icon: <Heart size={28} />, title: 'Terapia de Casal', desc: 'Mediação especializada para casais que buscam melhorar a comunicação e a qualidade do relacionamento.' },
              { icon: <Shield size={28} />, title: 'Gestão de Ansiedade', desc: 'Ferramentas práticas e compreensão profunda para lidar com crises de ansiedade, pânico e estresse crônico.' },
              { icon: <Calendar size={28} />, title: 'Orientação Profissional', desc: 'Apoio psicológico em transições de carreira e desenvolvimento de potencial em momentos decisivos.' }
            ].map((s, i) => (
              <motion.div key={i} className="service-card" variants={fadeInUp}>
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Avaliações */}
      <section id="avaliacoes" className="reviews-section">
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="section-tag">★ Avaliações</div>
            <h2>O que dizem os pacientes</h2>
            <div className="divider"></div>
            <p>Avaliações reais verificadas no Google</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginTop: '1rem' }}>
              {[...Array(5)].map((_, i) => <Star key={i} fill="#fbbc05" color="#fbbc05" size={22} />)}
            </div>
          </motion.div>

          <motion.div className="reviews-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            {[
              { name: 'Paciente', text: 'Profissional excelente, muito atenciosa e pontual. O consultório é super acolhedor. Tem me ajudado muito no meu processo de autoconhecimento.' },
              { name: 'Paciente', text: 'A Dra. Ana Paula transmite uma paz incrível. Desde a primeira sessão me senti muito confortável para falar sobre minhas questões. Recomendo de olhos fechados!' },
              { name: 'Paciente', text: 'Excelente psicóloga. A abordagem dela é muito empática. Consegui superar minhas crises de ansiedade com o acompanhamento que venho fazendo.' }
            ].map((r, i) => (
              <motion.div key={i} className="review-card" variants={fadeInUp}>
                <div className="review-stars">
                  {[...Array(5)].map((_, j) => <Star key={j} fill="#fbbc05" color="#fbbc05" size={16} />)}
                </div>
                <p className="review-text">"{r.text}"</p>
                <div className="review-author">— {r.name}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div style={{ textAlign: 'center', marginTop: '3.5rem' }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <a href="https://g.page/r/CVqcwn8_q56qEAI/review" target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Deixe sua avaliação no Google ★
            </a>
          </motion.div>
        </div>
      </section>

      {/* Agendamento */}
      <BookingSection />

      {/* Sobre */}
      <section id="sobre" className="about-section">
        <div className="container about-container">
          <motion.div className="about-image-placeholder" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <div className="psi-watermark">Ψ</div>
          </motion.div>
          <motion.div className="about-text" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <div className="section-tag" style={{ marginBottom: '1.5rem' }}>✦ Sobre Mim</div>
            <h2>Dra. Ana Paula Candido</h2>
            <div className="divider" style={{ margin: '1.5rem 0', marginLeft: 0 }}></div>
            <p>Sou psicóloga clínica dedicada a ajudar pessoas a superarem seus desafios emocionais e alcançarem uma vida mais equilibrada e significativa.</p>
            <p>Com uma abordagem humanizada e pautada na ética profissional, ofereço um ambiente de escuta livre de julgamentos, onde você pode ser autêntico e focar no seu crescimento.</p>
            <div className="about-features">
              {['Atendimento 100% confidencial', 'Sessões presenciais e online', 'Abordagem humanizada e empática', 'CRP 06/157985 ativo'].map(f => (
                <div key={f} className="about-feature">
                  <div className="about-feature-dot"></div>
                  {f}
                </div>
              ))}
            </div>
            <a href="#agendar" className="btn-primary">Agendar Consulta</a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="landing-footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <span className="footer-psi">Ψ</span>
            <h3>Ana Paula Candido</h3>
            <p>Psicóloga Clínica • CRP 06/157985</p>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              Cuidando da saúde mental com ética, empatia e profissionalismo.
            </p>
          </div>
          <div className="footer-contact">
            <h4>Contato</h4>
            <p>WhatsApp: (11) 90000-0000</p>
            <p>Email: contato@psicoanapaulacandido.com.br</p>
          </div>
          <div className="footer-address">
            <h4>Consultório</h4>
            <p>Atendimento Presencial</p>
            <p>e Online (Nationwide)</p>
            <p style={{ marginTop: '0.5rem' }}>São Paulo, SP</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Psicóloga Ana Paula Candido dos Santos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
