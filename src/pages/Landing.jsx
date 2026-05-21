import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Heart, Shield, Brain, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <span className="psi-symbol-nav">Ψ</span>
          <span className="nav-name">Ana Paula Candido</span>
        </div>
        <div className="nav-links">
          <a href="#sobre">Sobre Mim</a>
          <a href="#especialidades">Especialidades</a>
          <a href="#avaliacoes">Avaliações</a>
          <a href="#contato">Contato</a>
          <button className="btn-login-link" onClick={() => navigate('/login')}>
            Área do Profissional
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        {/* Animated Background */}
        <motion.div 
          className="hero-background-image"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        ></motion.div>
        
        {/* Floating pulse effect (React Beats style) */}
        <motion.div 
          className="hero-glow"
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>

        {/* CSS Animated Waves matching ReactBits style */}
        <div className="wave-animation"></div>
        <div className="wave-animation wave-animation-2"></div>

        <div className="hero-overlay"></div>
        
        <div className="hero-content">
          <motion.div 
            className="hero-text-content"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="hero-psi">Ψ</motion.span>
            <motion.h1 variants={fadeInUp} className="hero-title">Psicóloga Ana Paula Candido</motion.h1>
            <motion.p variants={fadeInUp} className="hero-subtitle">CRP: 06/157985</motion.p>
            <motion.p variants={fadeInUp} className="hero-description">
              Acolhimento, escuta ativa e transformação. Inicie sua jornada de autoconhecimento 
              e bem-estar emocional em um espaço seguro e profissional.
            </motion.p>
            <motion.div variants={fadeInUp} className="hero-buttons">
              <a href="#agendar" className="btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                Agendar Consulta <ArrowRight size={20} />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Serviços / Especialidades */}
      <section id="especialidades" className="services-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2>Áreas de Atuação</h2>
            <div className="divider"></div>
            <p>Tratamentos especializados para o seu desenvolvimento pessoal</p>
          </motion.div>

          <motion.div 
            className="services-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {[
              { icon: <Brain size={32} />, title: 'Psicoterapia Individual', desc: 'Espaço confidencial para explorar emoções, pensamentos e comportamentos que causam sofrimento.' },
              { icon: <Heart size={32} />, title: 'Terapia de Casal', desc: 'Mediação e auxílio na comunicação para casais que buscam melhorar a qualidade do relacionamento.' },
              { icon: <Shield size={32} />, title: 'Gestão de Ansiedade', desc: 'Ferramentas práticas e compreensão profunda para lidar com crises de ansiedade e estresse.' },
              { icon: <Calendar size={32} />, title: 'Orientação Profissional', desc: 'Apoio no desenvolvimento de carreira e transições profissionais em momentos de dúvida.' }
            ].map((service, index) => (
              <motion.div key={index} className="service-card" variants={fadeInUp}>
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Avaliações do Google */}
      <section id="avaliacoes" className="reviews-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2>O que dizem os pacientes</h2>
            <div className="divider"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-light)', opacity: 0.9 }}>
              Avaliações reais verificadas no Google
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.2rem', marginTop: '1rem', color: '#fbbc05' }}>
              <Star fill="#fbbc05" size={24} />
              <Star fill="#fbbc05" size={24} />
              <Star fill="#fbbc05" size={24} />
              <Star fill="#fbbc05" size={24} />
              <Star fill="#fbbc05" size={24} />
            </div>
          </motion.div>

          <motion.div 
            className="reviews-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {[
              { name: 'Paciente Anonimo', text: 'Profissional excelente, muito atenciosa e pontual. O consultório é super acolhedor. Tem me ajudado muito no meu processo de autoconhecimento.' },
              { name: 'Paciente Anonimo', text: 'A Dra. Ana Paula transmite uma paz incrível. Desde a primeira sessão me senti muito confortável para falar sobre minhas questões. Recomendo de olhos fechados!' },
              { name: 'Paciente Anonimo', text: 'Excelente psicóloga. A abordagem dela é muito empática. Consegui superar minhas crises de ansiedade com o acompanhamento que venho fazendo.' }
            ].map((review, index) => (
              <motion.div key={index} className="review-card" variants={fadeInUp}>
                <div className="review-stars">
                  <Star fill="#fbbc05" color="#fbbc05" size={16} />
                  <Star fill="#fbbc05" color="#fbbc05" size={16} />
                  <Star fill="#fbbc05" color="#fbbc05" size={16} />
                  <Star fill="#fbbc05" color="#fbbc05" size={16} />
                  <Star fill="#fbbc05" color="#fbbc05" size={16} />
                </div>
                <p className="review-text">"{review.text}"</p>
                <div className="review-author">- {review.name}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            style={{ textAlign: 'center', marginTop: '3rem' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <a href="https://g.page/r/CVqcwn8_q56qEAI/review" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ backgroundColor: '#fff', color: 'var(--primary-dark)', fontWeight: 'bold' }}>
              Deixe sua avaliação no Google
            </a>
          </motion.div>
        </div>
      </section>

      {/* Sobre Mim */}
      <section id="sobre" className="about-section">
        <div className="container about-container">
          <motion.div 
            className="about-image-placeholder"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="psi-watermark">Ψ</div>
          </motion.div>
          <motion.div 
            className="about-text"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2>Sobre a Dra. Ana Paula</h2>
            <div className="divider" style={{ margin: '1.5rem 0' }}></div>
            <p>
              Sou psicóloga clínica dedicada a ajudar pessoas a superarem seus desafios emocionais e 
              alcançarem uma vida mais equilibrada e significativa.
            </p>
            <p>
              Com uma abordagem humanizada e pautada na ética profissional (CRP 06/157985), ofereço um 
              ambiente de escuta livre de julgamentos, onde você pode ser autêntico e focar no seu crescimento.
            </p>
            <a href="#contato" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
              Fale Comigo
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="landing-footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <span className="footer-psi">Ψ</span>
            <h3>Ana Paula Candido</h3>
            <p>Psicóloga Clínica</p>
          </div>
          <div className="footer-contact">
            <h4>Contato</h4>
            <p>WhatsApp: (11) 90000-0000</p>
            <p>Email: contato@anapaula.com.br</p>
          </div>
          <div className="footer-address">
            <h4>Consultório</h4>
            <p>Atendimento Presencial e Online</p>
            <p>São Paulo, SP</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Psicóloga Ana Paula Candido. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
