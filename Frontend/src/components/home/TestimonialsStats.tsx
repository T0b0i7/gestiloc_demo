export default function TestimonialsStats() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Merriweather:wght@900&display=swap');
        
        .ts-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 100px 0 120px;
          background: #fff;
          overflow: hidden;
        }

        .ts-header {
          text-align: center;
          max-width: 1200px;
          margin-bottom: 80px;
          padding: 0 20px;
        }

        .ts-title {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 42px;
          color: #1a1a1a;
          line-height: 1.2;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }

        .ts-subtitle {
          font-family: 'Manrope', sans-serif;
          font-weight: 400;
          font-size: 18px;
          color: #555;
          line-height: 1.5;
        }

        .ts-scene {
          position: relative;
          width: 1200px;
          height: 1000px;
        }

        .ts-quote-card {
          position: absolute;
          background: white;
          border: 1.2px solid #b6deb8;
          border-radius: 12px;
          padding: 30px;
          width: 320px;
          font-family: 'Manrope', sans-serif;
          font-size: 16px;
          color: #1a1a1a;
          line-height: 1.6;
          z-index: 1;
        }

        .ts-quote-card .ts-author {
          margin-top: 20px;
          font-size: 14px;
          color: #555;
          font-weight: 500;
        }

        .ts-stat-card {
          position: absolute;
          border-radius: 12px;
          padding: 35px;
          width: 310px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 2;
          color: white;
          box-shadow: 0 15px 40px rgba(0,0,0,0.06);
        }

        .ts-stat-card .ts-percent {
          font-family: 'Merriweather', serif;
          font-weight: 900;
          font-size: 60px;
          line-height: 1;
        }

        .ts-stat-card .ts-stat-desc {
          font-family: 'Manrope', sans-serif;
          font-size: 15.5px;
          font-weight: 500;
          line-height: 1.5;
        }
      `}</style>

      <div className="ts-container">
        <div className="ts-header">
          <h2 className="ts-title">Nous aidons les bailleurs à gérer sereinement leurs emplacements</h2>
          <p className="ts-subtitle">Nous sommes accessibles, modernes et pensées pour les propriétaires béninois.</p>
        </div>

        <div className="ts-scene">
          {/* LIGNE DU HAUT - Alignement parfait à top: 240px pour 67% et 97% */}
          <div className="ts-quote-card" style={{ top: 0, left: 50 }}>
            "Ce site est un vrai bonheur pour les particuliers bailleurs et m'aide énormément ! À recommander !!"
            <div className="ts-author">– Pierre, Cotonou, Bénin</div>
          </div>
          <div className="ts-stat-card" style={{
            top: 280, left: 240,
            background: "#529D21"
          }}>
            <div className="ts-percent">67%</div>
            <div className="ts-stat-desc">de nos clients recommandent GestiLoc à leur entourage.</div>
          </div>

          <div className="ts-quote-card" style={{ top: 0, left: 830 }}>
            "Je tiens à vous dire un grand merci pour votre site. J'y ai énormément appris de choses. Bravo !"
            <div className="ts-author">– Francine, Porto-Novo, Bénin</div>
          </div>
          <div className="ts-stat-card" style={{
            top: 240, left: 930,
            background: "#83C757"
          }}>
            <div className="ts-percent">97%</div>
            <div className="ts-stat-desc">de nos clients affirment gagner en efficacité et en productivité.</div>
          </div>

          {/* LIGNE DU BAS */}
          <div className="ts-quote-card" style={{ top: 550, left: 440 }}>
            "Ce site est un vrai bonheur pour les particuliers bailleurs et m'aide énormément ! À recommander !!"
            <div className="ts-author">– Pierre, Cotonou, Bénin</div>
          </div>
          <div className="ts-stat-card" style={{
            top: 790, left: 560,
            background: "#9747FF"
          }}>
            <div className="ts-percent">83%</div>
            <div className="ts-stat-desc">de nos clients affirment que GestiLoc les aide à mieux suivre les loyers, charges et quittances.</div>
          </div>
        </div>
      </div>
    </>
  );
}
