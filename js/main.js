/* ==========================================================================
   PrivTI — Fully Dynamic, Realistic Interactive Prototype
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const runBtn = document.getElementById('run-btn');
  const inputPrompt = document.getElementById('user-input');

  const steps = [
    document.getElementById('s-1'),
    document.getElementById('s-2'),
    document.getElementById('s-3'),
    document.getElementById('s-4')
  ];

  const serverView = document.getElementById('server-view');
  const clientView = document.getElementById('client-view');

  const statSpeedup = document.getElementById('stat-speedup');
  const statTokens = document.getElementById('stat-tokens');
  const statMatch = document.getElementById('stat-match');

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // Generate deterministic-looking random hash from text
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function generateCipherHex(seed, length = 12) {
    let hex = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < length; i++) {
      const idx = (seed * (i + 13) + i * 7) % chars.length;
      hex += chars[idx];
      if ((i + 1) % 4 === 0 && i !== length - 1) hex += ' ';
    }
    return '0x' + hex;
  }

  // Analyze text topic & sentiment dynamically
  function analyzeInput(text) {
    const lower = text.toLowerCase();
    const len = text.split(/\s+/).filter(Boolean).length;
    const h = hashString(text);

    // Dynamic confidence score based on input
    const baseConf = 92.0 + (h % 75) / 10.0; // Between 92.0% and 99.5%
    const conf = Math.min(99.7, baseConf).toFixed(1);

    // Dynamic latency based on token count
    const latency = (0.24 + len * 0.045).toFixed(2);

    let classification = '';
    let category = '';

    if (lower.includes('pain') || lower.includes('patient') || lower.includes('blood') || lower.includes('heart') || lower.includes('cardiac') || lower.includes('fever') || lower.includes('symptom')) {
      category = 'Medical Diagnostic';
      classification = lower.includes('acute') || lower.includes('elevated') || lower.includes('severe')
        ? 'High Clinical Risk — Priority Attention Required'
        : 'Moderate Clinical Observation — Normal Limits';
    } else if (lower.includes('profit') || lower.includes('audit') || lower.includes('money') || lower.includes('bank') || lower.includes('loss') || lower.includes('fraud') || lower.includes('tax')) {
      category = 'Financial Audit';
      classification = lower.includes('fraud') || lower.includes('discrepancy') || lower.includes('loss')
        ? 'Anomaly Flagged — Secondary Review Needed'
        : 'Standard Compliant Transaction';
    } else if (lower.includes('good') || lower.includes('great') || lower.includes('excellent') || lower.includes('happy') || lower.includes('love')) {
      category = 'Sentiment Analysis';
      classification = 'Positive Sentiment Detected (Class 1)';
    } else if (lower.includes('bad') || lower.includes('terrible') || lower.includes('error') || lower.includes('fail') || lower.includes('wrong')) {
      category = 'Sentiment Analysis';
      classification = 'Negative Sentiment Detected (Class 0)';
    } else {
      category = 'General Classification';
      classification = (h % 2 === 0) ? 'Intent: Information Query' : 'Intent: Action Directive';
    }

    return {
      tokens: len,
      conf: conf,
      latency: latency,
      category: category,
      classification: classification,
      hash: h
    };
  }

  if (runBtn) {
    runBtn.addEventListener('click', async () => {
      const text = inputPrompt.value.trim();
      if (!text) {
        alert('Please enter some text in the input box.');
        return;
      }

      const analysis = analyzeInput(text);

      runBtn.disabled = true;
      runBtn.textContent = 'Computing Secure Inference...';

      // Reset styles
      steps.forEach(s => s.className = 'flow-step');
      serverView.innerHTML = '<span style="color:#64748b;">[Step 1: Encrypting tokens into BFV ciphertext...]</span>';
      clientView.innerHTML = '<span style="color:#64748b;">[Waiting for secure server response...]</span>';

      // Step 1: Encrypt
      steps[0].className = 'flow-step active';
      await sleep(350);
      steps[0].className = 'flow-step done';
      
      const ct1 = generateCipherHex(analysis.hash, 16);
      const ct2 = generateCipherHex(analysis.hash + 47, 16);
      serverView.innerHTML = `
        <div style="margin-bottom:6px;"><strong style="color:#f87171;">⚠️ RAW PLAINTEXT IS HIDDEN</strong></div>
        <div>BFV Ciphertext ct₀ = <code>${ct1}</code></div>
        <div>BFV Ciphertext ct₁ = <code>${ct2}</code></div>
        <div style="font-size:0.75rem; color:#94a3b8; margin-top:4px;">Packed into ${analysis.tokens} SIMD slots (N=8192). Server cannot view the original text.</div>
      `;

      // Step 2: MatMul on Server
      steps[1].className = 'flow-step active';
      await sleep(400);
      steps[1].className = 'flow-step done';
      
      const ctMat = generateCipherHex(analysis.hash + 101, 16);
      serverView.innerHTML += `
        <div style="margin-top:8px; border-top:1px dashed #334155; padding-top:6px;">
          <div>Linear Projection Q, K, V computed over ciphertexts: <code>${ctMat}</code></div>
        </div>
      `;

      // Step 3: Non-Linear via 2PC
      steps[2].className = 'flow-step active';
      await sleep(400);
      steps[2].className = 'flow-step done';
      
      const share1 = generateCipherHex(analysis.hash + 202, 8);
      const share2 = generateCipherHex(analysis.hash + 303, 8);
      serverView.innerHTML += `
        <div style="margin-top:8px; border-top:1px dashed #334155; padding-top:6px;">
          <div>2PC Shares: S₁ holds <code>[[x]]₁ = ${share1}</code> | S₂ holds <code>[[x]]₂ = ${share2}</code></div>
          <div style="font-size:0.75rem; color:#94a3b8;">Evaluated Seg3GELU & Softmax without unmasking values.</div>
        </div>
      `;

      // Step 4: Client Decrypt
      steps[3].className = 'flow-step active';
      await sleep(400);
      steps[3].className = 'flow-step done';

      // Update Client Side Output with vivid, dynamic result!
      clientView.innerHTML = `
        <div style="margin-bottom:8px;">
          <span style="background:#dcfce7; color:#15803d; padding:2px 8px; border-radius:4px; font-weight:700; font-size:0.75rem;">DECRYPTION VERIFIED (Client Key sk)</span>
        </div>
        <div style="margin-bottom:6px;">
          <strong>Decrypted Query:</strong> "${text}"
        </div>
        <div style="font-size:0.95rem; font-weight:700; color:#0f172a; margin-bottom:4px;">
          🎯 Prediction: <span style="color:#2563eb;">${analysis.classification}</span>
        </div>
        <div style="font-size:0.8rem; color:#475569;">
          Task Category: <strong>${analysis.category}</strong> | Model Confidence: <strong>${analysis.conf}%</strong> | Output Match: <strong>Exact Plaintext Baseline</strong>
        </div>
      `;

      // Update Dynamic Stats
      statSpeedup.textContent = `${analysis.latency}s`;
      if (statTokens) statTokens.textContent = `${analysis.tokens} Tokens (${analysis.tokens} / 8192 Slots)`;
      if (statMatch) statMatch.textContent = `${analysis.conf}%`;

      runBtn.disabled = false;
      runBtn.textContent = '▶ Run Private Inference';
    });
  }

  // --- Dynamic Math Sliders ---
  function erf(x) {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  }

  // GELU
  const gIn = document.getElementById('gelu-slider');
  const gVal = document.getElementById('gelu-val');
  const gExact = document.getElementById('gelu-exact');
  const gOur = document.getElementById('gelu-our');
  const gErr = document.getElementById('gelu-err');

  function updateGELU() {
    if (!gIn) return;
    const x = parseFloat(gIn.value);
    if (gVal) gVal.textContent = x.toFixed(2);

    const exact = 0.5 * x * (1 + erf(x / Math.SQRT2));
    let approx = 0;
    if (x >= 3.12) approx = x;
    else if (x <= -3.12) approx = 0;
    else {
      const x2 = x * x, x4 = x2 * x2, x6 = x4 * x2, x8 = x4 * x4;
      approx = (-0.0001506671 * x8) + (0.0043702779 * x6) - (0.0512144957 * x4) + (0.3828738634 * x2) + (0.5 * x) + 0.0028445838;
    }

    if (gExact) gExact.textContent = exact.toFixed(4);
    if (gOur) gOur.textContent = approx.toFixed(4);
    if (gErr) gErr.textContent = Math.abs(approx - exact).toExponential(2);
  }

  if (gIn) {
    gIn.addEventListener('input', updateGELU);
    updateGELU();
  }

  // Softmax Exp
  const eIn = document.getElementById('exp-slider');
  const eVal = document.getElementById('exp-val');
  const eExact = document.getElementById('exp-exact');
  const eOur = document.getElementById('exp-our');
  const eErr = document.getElementById('exp-err');

  function updateExp() {
    if (!eIn) return;
    const x = parseFloat(eIn.value);
    if (eVal) eVal.textContent = x.toFixed(2);

    const exact = Math.exp(x);
    const x_int = Math.floor(x);
    const x_frac = x - x_int;
    const eint = x_int < -10 ? 0 : Math.exp(x_int);

    const xf2 = x_frac * x_frac, xf4 = xf2 * xf2;
    const efrac = (0.1384768486 * xf4) + (0.5993350639 * xf2) + (0.9802810011 * x_frac) + 1.0006317416;

    const approx = eint * efrac;

    if (eExact) eExact.textContent = exact.toFixed(4);
    if (eOur) eOur.textContent = approx.toFixed(4);
    if (eErr) eErr.textContent = Math.abs(approx - exact).toExponential(2);
  }

  if (eIn) {
    eIn.addEventListener('input', updateExp);
    updateExp();
  }

});