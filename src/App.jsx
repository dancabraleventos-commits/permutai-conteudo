import { useState, useCallback } from "react";

const THEMES = [
  { id: "dica", label: "💡 Dica de Permuta", color: "#00C49A", desc: "Educativo sobre como funciona permuta" },
  { id: "autoridade", label: "🏆 Autoridade / Tech", color: "#6C63FF", desc: "Posiciona a Permutaí como referência" },
  { id: "mito", label: "❌ Mito vs Verdade", color: "#FF6B6B", desc: "Quebra objeção comum do mercado" },
  { id: "numeros", label: "📊 Dados do Mercado", color: "#F59E0B", desc: "Estatísticas e fatos sobre permuta" },
];

const FORMATS = [
  { id: "carrossel", label: "🎠 Carrossel", slides: true },
  { id: "reels", label: "🎬 Reels (roteiro)", slides: false },
  { id: "estatico", label: "🖼️ Post Estático", slides: false },
  { id: "stories", label: "📱 Stories (3 telas)", slides: true },
];

const IMAGE_TOOLS = [
  { id: "midjourney", label: "Midjourney" },
  { id: "dalle", label: "DALL-E 3" },
  { id: "ideogram", label: "Ideogram" },
];

function CopyButton({ text, small }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} style={{
      background: copied ? "#00C49A" : "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#fff",
      padding: small ? "4px 10px" : "6px 14px",
      borderRadius: "8px",
      fontSize: small ? "11px" : "12px",
      cursor: "pointer",
      transition: "all 0.2s",
      fontFamily: "inherit",
      letterSpacing: "0.02em",
      flexShrink: 0,
    }}>
      {copied ? "✓ Copiado!" : "Copiar"}
    </button>
  );
}

function ContentBlock({ label, content, accent }) {
  if (!content) return null;
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${accent}30`,
      borderLeft: `3px solid ${accent}`,
      borderRadius: "10px",
      padding: "16px 18px",
      marginBottom: "12px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", color: accent, textTransform: "uppercase" }}>
          {label}
        </span>
        <CopyButton text={content} />
      </div>
      <pre style={{
        margin: 0, whiteSpace: "pre-wrap",
        fontFamily: "'DM Mono', 'Fira Code', monospace",
        fontSize: "13px", color: "#E2E8F0", lineHeight: "1.7",
      }}>{content}</pre>
    </div>
  );
}

function ImagePromptBlock({ visualDescription, theme, format, imageTool }) {
  const [imgPrompt, setImgPrompt] = useState(null);
  const [loading, setLoading] = useState(false);

  const toolInstructions = {
    midjourney: "Escreva o prompt em inglês otimizado para Midjourney. Termine com os parâmetros: --ar 1:1 --style raw --v 6.1. Seja descritivo sobre composição, iluminação e estilo visual.",
    dalle: "Escreva o prompt em inglês detalhado para DALL-E 3. Descreva cena, estilo artístico, iluminação, composição e paleta de cores. Tom claro e descritivo.",
    ideogram: "Escreva o prompt em inglês para Ideogram. Inclua qualquer texto que deva aparecer NA imagem entre aspas duplas. Ideogram é excelente para imagens com texto incorporado.",
  };

  const generate = async () => {
    if (!visualDescription) return;
    setLoading(true);
    setImgPrompt(null);

    const prompt = `Você é especialista em criar prompts de imagem para IA generativa.

Contexto:
- Marca: Permutaí (plataforma de IA para permuta de imóveis)
- Público: corretores e imobiliárias brasileiras
- Tipo de post: ${theme}
- Formato: ${format}
- Descrição visual fornecida: ${visualDescription}
- Ferramenta alvo: ${imageTool}

Crie um prompt de imagem profissional para gerar a arte deste post de Instagram.

Diretrizes visuais da marca Permutaí:
- Paleta: roxo profundo #6C63FF + verde água #00C49A + fundo escuro #0A0D14
- Estilo: tech moderno, limpo, sofisticado — NÃO genérico
- Deve transmitir: inteligência artificial, mercado imobiliário, confiança, inovação
- Adequado para Instagram (proporção 1:1 ou 4:5)

${toolInstructions[imageTool]}

Retorne APENAS o prompt. Sem introdução, sem explicação, sem markdown.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setImgPrompt(text.trim());
    } catch {
      setImgPrompt("Erro ao gerar prompt. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const toolLinks = {
    midjourney: "https://www.midjourney.com",
    dalle: "https://chatgpt.com",
    ideogram: "https://ideogram.ai",
  };

  return (
    <div style={{
      background: "rgba(108,99,255,0.06)",
      border: "1px solid rgba(108,99,255,0.25)",
      borderRadius: "12px",
      padding: "18px",
      marginBottom: "12px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", color: "#6C63FF", textTransform: "uppercase" }}>
            🎨 Prompt de Imagem · {imageTool.charAt(0).toUpperCase() + imageTool.slice(1)}
          </div>
          <div style={{ fontSize: "11px", color: "#475569", marginTop: "3px" }}>
            Gerado com base na sugestão visual acima
          </div>
        </div>
        <button onClick={generate} disabled={loading} style={{
          background: loading ? "rgba(108,99,255,0.15)" : "rgba(108,99,255,0.25)",
          border: "1px solid rgba(108,99,255,0.45)",
          color: "#A5A0FF",
          padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px",
          transition: "all 0.15s",
        }}>
          {loading ? (
            <>
              <span style={{
                display: "inline-block", width: "10px", height: "10px",
                border: "2px solid rgba(165,160,255,0.3)", borderTopColor: "#A5A0FF",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
              Gerando...
            </>
          ) : "✨ Gerar prompt"}
        </button>
      </div>

      {!imgPrompt && !loading && (
        <div style={{
          fontSize: "12px", color: "#334155", fontStyle: "italic",
          padding: "10px 0",
        }}>
          Clique em "Gerar prompt" → copie → cole no {imageTool.charAt(0).toUpperCase() + imageTool.slice(1)} → gere a arte
        </div>
      )}

      {imgPrompt && (
        <div>
          <div style={{
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(108,99,255,0.2)",
            borderRadius: "8px",
            padding: "14px",
            marginBottom: "12px",
          }}>
            <pre style={{
              margin: 0, whiteSpace: "pre-wrap",
              fontFamily: "'DM Mono', 'Fira Code', monospace",
              fontSize: "12px", color: "#CBD5E1", lineHeight: "1.75",
            }}>{imgPrompt}</pre>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <CopyButton text={imgPrompt} small />
            <a
              href={toolLinks[imageTool]}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "11px", color: "#6C63FF",
                textDecoration: "none",
                background: "rgba(108,99,255,0.1)",
                border: "1px solid rgba(108,99,255,0.3)",
                padding: "4px 10px", borderRadius: "6px",
              }}
            >
              Abrir {imageTool.charAt(0).toUpperCase() + imageTool.slice(1)} →
            </a>
            <span style={{ fontSize: "11px", color: "#334155" }}>
              Cole o prompt → gere → baixe → poste no Instagram
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function parseContent(raw) {
  const sections = {};
  const lines = raw.split('\n');
  let current = null;
  let buffer = [];

  const flush = () => {
    if (current && buffer.length > 0) {
      sections[current] = buffer.join('\n').trim();
    }
  };

  const markers = {
    '📌': 'hook', '📝': 'legenda', '#': 'hashtags',
    '🎯': 'cta', '🖼️': 'visual', '🎬': 'roteiro',
    '📱': 'slides', '💡': 'conceito',
  };

  for (const line of lines) {
    let matched = false;
    for (const [emoji, key] of Object.entries(markers)) {
      if (line.startsWith(emoji) || line.toLowerCase().startsWith(key)) {
        flush(); current = key; buffer = [line]; matched = true; break;
      }
    }
    if (!matched && current) buffer.push(line);
  }
  flush();

  if (Object.keys(sections).length === 0) sections['legenda'] = raw;
  return sections;
}

export default function App() {
  const [theme, setTheme] = useState(THEMES[0]);
  const [format, setFormat] = useState(FORMATS[0]);
  const [imageTool, setImageTool] = useState("midjourney");
  const [customTopic, setCustomTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const generate = useCallback(async () => {
    setLoading(true); setError(null); setResult(null);

    const topic = customTopic.trim() || `${theme.desc} para corretores de imóveis brasileiros`;

    const prompt = `Você é um especialista em marketing imobiliário e criador de conteúdo para Instagram.

Crie conteúdo para a **Permutaí** — plataforma de inteligência artificial para match de permuta de imóveis. A Permutaí usa IA para encontrar automaticamente oportunidades de troca de imóveis, incluindo triangulações entre 3 ou mais imóveis. O público são corretores e imobiliárias brasileiras.

**Tipo de conteúdo:** ${theme.label}
**Formato:** ${format.label}
**Tema/assunto:** ${topic}

Gere o conteúdo completo seguindo EXATAMENTE esta estrutura:

📌 HOOK (primeira linha antes do "ver mais" — máx 2 linhas, impactante):
[escreva aqui]

📝 LEGENDA COMPLETA (tom profissional mas acessível, 150-250 palavras, parágrafos curtos):
[escreva aqui]

🎯 CTA (call to action final, 1 linha):
[escreva aqui]

# HASHTAGS (20 hashtags, mistura nicho + alcance):
[escreva aqui]

🖼️ SUGESTÃO VISUAL (descreva exatamente cores, elementos, texto em destaque, estilo para o designer):
[escreva aqui]

${format.slides ? `📱 ESTRUTURA DOS SLIDES (slide por slide, máx 15 palavras cada):
[escreva aqui]` : ""}${format.id === "reels" ? `🎬 ROTEIRO REELS (máx 30 segundos, cena por cena com narração e o que aparece na tela):
[escreva aqui]` : ""}

Seja criativo, específico para o mercado imobiliário brasileiro. Evite clichês genéricos.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const parsed = parseContent(text);

      const item = {
        id: Date.now(),
        theme: theme.label, themeColor: theme.color,
        format: format.label, topic,
        parsed, raw: text, accent: theme.color, imageTool,
        at: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };

      setResult(item);
      setHistory(h => [item, ...h.slice(0, 9)]);
    } catch {
      setError("Erro ao gerar conteúdo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [theme, format, customTopic, imageTool]);

  const sectionLabels = {
    hook: "📌 Hook", legenda: "📝 Legenda completa", cta: "🎯 CTA",
    hashtags: "# Hashtags", visual: "🖼️ Sugestão visual",
    slides: "📱 Slides", roteiro: "🎬 Roteiro", conceito: "💡 Conceito",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0D14",
      backgroundImage: `
        radial-gradient(ellipse 80% 50% at 20% -10%, #6C63FF18 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 110%, #00C49A18 0%, transparent 60%)
      `,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#E2E8F0",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
        padding: "18px 32px", display: "flex", alignItems: "center", gap: "14px",
        backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{
          width: "34px", height: "34px",
          background: "linear-gradient(135deg, #6C63FF, #00C49A)",
          borderRadius: "10px", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "17px", flexShrink: 0,
        }}>🏠</div>
        <div>
          <div style={{ fontWeight: "700", fontSize: "15px", letterSpacing: "-0.02em" }}>
            Permutaí — Gerador de Conteúdo Instagram
          </div>
          <div style={{ fontSize: "11px", color: "#64748B" }}>
            Texto + Hashtags + Prompt de Imagem · sem API do Instagram
          </div>
        </div>
        {history.length > 0 && (
          <div style={{
            marginLeft: "auto", fontSize: "12px", color: "#64748B",
            background: "rgba(255,255,255,0.04)", padding: "4px 12px",
            borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            {history.length} gerado{history.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Workflow bar */}
      <div style={{
        background: "rgba(0,196,154,0.04)", borderBottom: "1px solid rgba(0,196,154,0.08)",
        padding: "9px 32px", display: "flex", gap: "6px", alignItems: "center",
        fontSize: "11px", color: "#475569", overflowX: "auto",
      }}>
        {[
          "1. Escolha tipo + formato",
          "→", "2. Gere o conteúdo",
          "→", "3. Clique em Gerar Prompt de Imagem",
          "→", "4. Cole no Midjourney / DALL-E / Ideogram",
          "→", "5. Agende no Meta Business Suite"
        ].map((s, i) => (
          <span key={i} style={{
            color: s === "→" ? "#1e293b" : i === 4 ? "#00C49A" : "#475569",
            whiteSpace: "nowrap",
            fontWeight: i === 4 ? "700" : "400",
          }}>{s}</span>
        ))}
      </div>

      <div style={{ display: "flex", maxWidth: "1200px", margin: "0 auto", padding: "28px 24px", gap: "28px" }}>

        {/* LEFT */}
        <div style={{ width: "300px", flexShrink: 0 }}>
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px", padding: "22px", position: "sticky", top: "90px",
          }}>

            <div style={{ marginBottom: "22px" }}>
              <label style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
                Tipo de Conteúdo
              </label>
              {THEMES.map(t => (
                <button key={t.id} onClick={() => setTheme(t)} style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: theme.id === t.id ? `${t.color}15` : "transparent",
                  border: `1px solid ${theme.id === t.id ? t.color + "60" : "rgba(255,255,255,0.06)"}`,
                  color: theme.id === t.id ? "#fff" : "#94A3B8",
                  padding: "9px 13px", borderRadius: "9px", cursor: "pointer",
                  marginBottom: "5px", fontSize: "13px", fontFamily: "inherit", transition: "all 0.15s",
                }}>
                  <div style={{ fontWeight: "600" }}>{t.label}</div>
                  <div style={{ fontSize: "11px", opacity: 0.55, marginTop: "2px" }}>{t.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
                Formato
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                {FORMATS.map(f => (
                  <button key={f.id} onClick={() => setFormat(f)} style={{
                    background: format.id === f.id ? "rgba(108,99,255,0.2)" : "transparent",
                    border: `1px solid ${format.id === f.id ? "#6C63FF80" : "rgba(255,255,255,0.06)"}`,
                    color: format.id === f.id ? "#fff" : "#94A3B8",
                    padding: "8px 6px", borderRadius: "8px", cursor: "pointer",
                    fontSize: "11px", fontFamily: "inherit", textAlign: "center", transition: "all 0.15s",
                  }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
                🎨 Ferramenta de Imagem
              </label>
              <div style={{ display: "flex", gap: "5px" }}>
                {IMAGE_TOOLS.map(t => (
                  <button key={t.id} onClick={() => setImageTool(t.id)} style={{
                    flex: 1,
                    background: imageTool === t.id ? "rgba(0,196,154,0.15)" : "transparent",
                    border: `1px solid ${imageTool === t.id ? "#00C49A60" : "rgba(255,255,255,0.06)"}`,
                    color: imageTool === t.id ? "#00C49A" : "#64748B",
                    padding: "7px 4px", borderRadius: "8px", cursor: "pointer",
                    fontSize: "11px", fontFamily: "inherit", textAlign: "center",
                    fontWeight: imageTool === t.id ? "700" : "400", transition: "all 0.15s",
                  }}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: "10px", color: "#334155", marginTop: "6px", lineHeight: "1.5" }}>
                {imageTool === "midjourney" && "Melhor para imagens artísticas e fotorrealistas"}
                {imageTool === "dalle" && "Integrado ao ChatGPT · gratuito com conta Plus"}
                {imageTool === "ideogram" && "Ótimo para imagens com texto incorporado"}
              </div>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
                Tópico específico (opcional)
              </label>
              <textarea
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="Ex: como a IA encontra triangulações impossíveis manualmente"
                rows={3}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px",
                  color: "#E2E8F0", padding: "9px 11px", fontSize: "12px",
                  fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: "1.5",
                }}
              />
            </div>

            <button onClick={generate} disabled={loading} style={{
              width: "100%",
              background: loading ? "rgba(108,99,255,0.3)" : "linear-gradient(135deg, #6C63FF, #00C49A)",
              border: "none", color: "#fff", padding: "13px", borderRadius: "11px",
              fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit", letterSpacing: "0.02em", transition: "all 0.2s",
            }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span style={{
                    display: "inline-block", width: "13px", height: "13px",
                    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                    borderRadius: "50%", animation: "spin 0.8s linear infinite",
                  }} />
                  Gerando conteúdo...
                </span>
              ) : "✨ Gerar Conteúdo"}
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {!result && !loading && !error && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", minHeight: "420px", textAlign: "center",
            }}>
              <div style={{ fontSize: "52px", marginBottom: "16px" }}>🏡</div>
              <div style={{ fontSize: "17px", fontWeight: "600", marginBottom: "8px", color: "#475569" }}>
                Pronto para gerar
              </div>
              <div style={{ fontSize: "13px", color: "#334155" }}>
                Escolha o tipo, formato e ferramenta de imagem → Gerar
              </div>
              <div style={{
                marginTop: "24px", padding: "16px 24px",
                background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.15)",
                borderRadius: "12px", maxWidth: "380px",
              }}>
                <div style={{ fontSize: "12px", color: "#6C63FF", fontWeight: "600", marginBottom: "8px" }}>
                  Como funciona o fluxo completo:
                </div>
                {[
                  "Gera texto + hashtags + CTA",
                  "Gera prompt de imagem para sua ferramenta",
                  "Você cria a arte com o prompt",
                  "Cola no Meta Business Suite e agenda",
                ].map((s, i) => (
                  <div key={i} style={{ fontSize: "12px", color: "#475569", marginBottom: "4px", display: "flex", gap: "8px" }}>
                    <span style={{ color: "#00C49A", fontWeight: "700" }}>{i + 1}.</span> {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", minHeight: "420px",
            }}>
              <div style={{
                width: "44px", height: "44px",
                border: "3px solid rgba(108,99,255,0.2)", borderTopColor: "#6C63FF",
                borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "18px",
              }} />
              <div style={{ fontSize: "14px", color: "#6C63FF" }}>Criando conteúdo para a Permutaí...</div>
              <div style={{ fontSize: "12px", color: "#334155", marginTop: "6px" }}>Pode levar alguns segundos</div>
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)",
              borderRadius: "12px", padding: "20px", color: "#FF6B6B", textAlign: "center",
            }}>{error}</div>
          )}

          {result && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", flexWrap: "wrap" }}>
                <div style={{
                  padding: "5px 13px",
                  background: `${result.accent}20`, border: `1px solid ${result.accent}40`,
                  borderRadius: "20px", fontSize: "12px", fontWeight: "600", color: result.accent,
                }}>{result.theme}</div>
                <div style={{
                  padding: "5px 13px", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px", fontSize: "12px", color: "#64748B",
                }}>{result.format}</div>
                <div style={{
                  padding: "5px 13px", background: "rgba(0,196,154,0.08)",
                  border: "1px solid rgba(0,196,154,0.2)",
                  borderRadius: "20px", fontSize: "12px", color: "#00C49A",
                }}>🎨 {result.imageTool}</div>
                <div style={{ marginLeft: "auto", fontSize: "11px", color: "#334155" }}>{result.at}</div>
                <CopyButton text={result.raw} />
              </div>

              {/* All sections except visual */}
              {Object.entries(result.parsed)
                .filter(([k]) => k !== "visual")
                .map(([key, content]) => (
                  <ContentBlock key={key} label={sectionLabels[key] || key} content={content} accent={result.accent} />
                ))
              }

              {/* Visual section */}
              {result.parsed.visual && (
                <ContentBlock label="🖼️ Sugestão visual" content={result.parsed.visual} accent={result.accent} />
              )}

              {/* Image prompt generator — always shown after visual */}
              <ImagePromptBlock
                visualDescription={result.parsed.visual || result.raw.slice(0, 300)}
                theme={result.theme}
                format={result.format}
                imageTool={result.imageTool}
                accent={result.accent}
              />

              <div style={{
                marginTop: "14px", padding: "13px 17px",
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: "12px", color: "#475569" }}>
                  Copiar tudo → colar no Meta Business Suite para agendar
                </span>
                <CopyButton text={result.raw} />
              </div>
            </div>
          )}

          {history.length > 1 && (
            <div style={{ marginTop: "36px" }}>
              <div style={{
                fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em",
                color: "#334155", textTransform: "uppercase", marginBottom: "10px",
              }}>
                Gerados nesta sessão
              </div>
              {history.slice(1).map(item => (
                <div
                  key={item.id}
                  onClick={() => setResult(item)}
                  style={{
                    padding: "11px 15px",
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                    borderLeft: `3px solid ${item.accent}`, borderRadius: "8px",
                    marginBottom: "5px", cursor: "pointer",
                    display: "flex", gap: "12px", alignItems: "center", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", color: "#CBD5E1", fontWeight: "500" }}>{item.theme} · {item.format}</div>
                    <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.topic}</div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#334155", flexShrink: 0 }}>{item.at}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
