// Custom editor components for Sveltia CMS
// These appear in the rich text editor's Insert button menu

// ── Methods/Protocol ──
CMS.registerEditorComponent({
  id: 'methods-protocol',
  label: 'Methods / Protocol',
  icon: 'science',
  fields: [
    { name: 'name', label: 'Protocol Name' },
    { name: 'purpose', label: 'Purpose', widget: 'text' },
    { name: 'materials', label: 'Materials/Reagents (one per line)', widget: 'text' },
    { name: 'equipment', label: 'Equipment (one per line)', widget: 'text' },
    { name: 'procedure', label: 'Procedure Steps (one per line)', widget: 'text' },
    { name: 'positiveControl', label: 'Positive Control' },
    { name: 'negativeControl', label: 'Negative Control' },
    { name: 'expectedResults', label: 'Expected Results', widget: 'text' },
    { name: 'modifications', label: 'Modifications from Standard', widget: 'text' },
  ],
  pattern: /^## Protocol: (?<name>.+)\n\n\*\*Purpose:\*\* (?<purpose>[\s\S]+?)\n\n\*\*Materials\/Reagents:\*\*\n(?<materials>[\s\S]+?)\n\n\*\*Equipment:\*\*\n(?<equipment>[\s\S]+?)\n\n\*\*Procedure:\*\*\n(?<procedure>[\s\S]+?)\n\n\*\*Controls:\*\*\n- Positive control: (?<positiveControl>[\s\S]*?)\n- Negative control: (?<negativeControl>[\s\S]*?)\n\n\*\*Expected Results:\*\* (?<expectedResults>[\s\S]+?)\n\n\*\*Modifications:\*\* (?<modifications>[\s\S]*?)$/m,
  toBlock: ({
    name = '',
    purpose = '',
    materials = '',
    equipment = '',
    procedure = '',
    positiveControl = '',
    negativeControl = '',
    expectedResults = '',
    modifications = '',
  }) => {
    const materialsList = materials
      .split('\n')
      .filter(Boolean)
      .map((m) => `- ${m}`)
      .join('\n');
    const equipmentList = equipment
      .split('\n')
      .filter(Boolean)
      .map((e) => `- ${e}`)
      .join('\n');
    const steps = procedure
      .split('\n')
      .filter(Boolean)
      .map((s, i) => `${i + 1}. ${s}`)
      .join('\n');

    return `## Protocol: ${name}

**Purpose:** ${purpose}

**Materials/Reagents:**
${materialsList || '- [Not specified]'}

**Equipment:**
${equipmentList || '- [Not specified]'}

**Procedure:**
${steps || '[Not specified]'}

**Controls:**
- Positive control: ${positiveControl || '[Not specified]'}
- Negative control: ${negativeControl || '[Not specified]'}

**Expected Results:** ${expectedResults || '[Not specified]'}

**Modifications:** ${modifications || 'None from standard protocol'}`;
  },
  toPreview: (data) => {
    return `<div style="padding:0.75em 1em;border-left:4px solid #6366f1;background:#f8fafc;border-radius:0 4px 4px 0">
      <strong>🧪 Protocol: ${data.name}</strong>
      <p style="margin:0.25em 0 0;color:#666">${data.purpose}</p>
    </div>`;
  },
});

// ── Results Summary ──
CMS.registerEditorComponent({
  id: 'results-summary',
  label: 'Results Summary',
  icon: 'analytics',
  fields: [
    { name: 'experiment', label: 'Experiment/Analysis Name' },
    { name: 'date', label: 'Date (YYYY-MM-DD)' },
    { name: 'sampleSize', label: 'Sample Size (N)' },
    { name: 'findings', label: 'Key Findings (one per line)', widget: 'text' },
    { name: 'interpretation', label: 'Interpretation', widget: 'text' },
    { name: 'limitations', label: 'Limitations', widget: 'text' },
    { name: 'nextSteps', label: 'Next Steps (one per line)', widget: 'text' },
  ],
  pattern: /^## Results Summary: (?<experiment>.+)\n\n\*\*Date:\*\* (?<date>[\s\S]+?) \| \*\*Sample Size:\*\* N = (?<sampleSize>[\s\S]+?)\n\n\*\*Key Findings:\*\*\n(?<findings>[\s\S]+?)\n\n\*\*Interpretation:\*\* (?<interpretation>[\s\S]+?)\n\n\*\*Limitations:\*\* (?<limitations>[\s\S]+?)\n\n\*\*Next Steps:\*\*\n(?<nextSteps>[\s\S]*?)$/m,
  toBlock: ({
    experiment = '',
    date = '',
    sampleSize = '',
    findings = '',
    interpretation = '',
    limitations = '',
    nextSteps = '',
  }) => {
    const findingsList = findings
      .split('\n')
      .filter(Boolean)
      .map((f, i) => `${i + 1}. ${f}`)
      .join('\n');
    const nextStepsList = nextSteps
      .split('\n')
      .filter(Boolean)
      .map((s) => `- [ ] ${s}`)
      .join('\n');

    return `## Results Summary: ${experiment}

**Date:** ${date || '[Not specified]'} | **Sample Size:** N = ${sampleSize || '?'}

**Key Findings:**
${findingsList || '[Not specified]'}

**Interpretation:** ${interpretation || '[Not specified]'}

**Limitations:** ${limitations || '[Not specified]'}

**Next Steps:**
${nextStepsList || '- [ ] [Not specified]'}`;
  },
  toPreview: (data) => {
    return `<div style="padding:0.75em 1em;border-left:4px solid #22c55e;background:#f8fafc;border-radius:0 4px 4px 0">
      <strong>📊 Results: ${data.experiment}</strong>
      <p style="margin:0.25em 0 0;color:#666">N = ${data.sampleSize || '?'}</p>
    </div>`;
  },
});

// ── Literature Review ──
CMS.registerEditorComponent({
  id: 'literature-review',
  label: 'Literature Review',
  icon: 'menu_book',
  fields: [
    { name: 'citation', label: 'Citation (Author, Year, Title, Journal)' },
    { name: 'researchQuestion', label: 'Research Question' },
    { name: 'methods', label: 'Methods (brief)' },
    { name: 'findings', label: 'Key Findings (one per line)', widget: 'text' },
    { name: 'relevance', label: 'Relevance to My Work', widget: 'text' },
    { name: 'strengths', label: 'Strengths (one per line)', widget: 'text' },
    { name: 'limitations', label: 'Limitations (one per line)', widget: 'text' },
    { name: 'ideas', label: 'Ideas/Questions (one per line)', widget: 'text' },
    { name: 'relevanceRating', label: 'Relevance (1-5)', widget: 'number', valueType: 'int', min: 1, max: 5 },
    { name: 'qualityRating', label: 'Quality (1-5)', widget: 'number', valueType: 'int', min: 1, max: 5 },
  ],
  pattern: /^## Literature: (?<citation>.+)\n\n\*\*Research Question:\*\* (?<researchQuestion>[\s\S]+?)\n\n\*\*Methods:\*\* (?<methods>[\s\S]+?)\n\n\*\*Key Findings:\*\*\n(?<findings>[\s\S]+?)\n\n\*\*Relevance to My Work:\*\* (?<relevance>[\s\S]+?)\n\n\*\*Strengths:\*\*\n(?<strengths>[\s\S]+?)\n\n\*\*Limitations:\*\*\n(?<limitations>[\s\S]+?)\n\n\*\*Ideas\/Questions Raised:\*\*\n(?<ideas>[\s\S]+?)\n\n\*\*Rating:\*\* Relevance: (?<relevanceRating>\d+)\/5 \| Quality: (?<qualityRating>\d+)\/5/m,
  toBlock: ({
    citation = '',
    researchQuestion = '',
    methods = '',
    findings = '',
    relevance = '',
    strengths = '',
    limitations = '',
    ideas = '',
    relevanceRating = '',
    qualityRating = '',
  }) => {
    const findingsList = findings
      .split('\n')
      .filter(Boolean)
      .map((f, i) => `${i + 1}. ${f}`)
      .join('\n');
    const strengthsList = strengths
      .split('\n')
      .filter(Boolean)
      .map((s) => `- ${s}`)
      .join('\n');
    const limitationsList = limitations
      .split('\n')
      .filter(Boolean)
      .map((l) => `- ${l}`)
      .join('\n');
    const ideasList = ideas
      .split('\n')
      .filter(Boolean)
      .map((i) => `- ${i}`)
      .join('\n');

    return `## Literature: ${citation}

**Research Question:** ${researchQuestion}

**Methods:** ${methods}

**Key Findings:**
${findingsList || '[Not specified]'}

**Relevance to My Work:** ${relevance}

**Strengths:**
${strengthsList || '- [Not specified]'}

**Limitations:**
${limitationsList || '- [ specified]'}

**Ideas/Questions Raised:**
${ideasList || '- [Not specified]'}

**Rating:** Relevance: ${relevanceRating || '?'}/5 | Quality: ${qualityRating || '?'}/5`;
  },
  toPreview: (data) => {
    return `<div style="padding:0.75em 1em;border-left:4px solid #f59e0b;background:#f8fafc;border-radius:0 4px 4px 0">
      <strong>📚 Literature: ${data.citation}</strong>
      <p style="margin:0.25em 0 0;color:#666">Relevance: ${data.relevanceRating || '?'}/5 | Quality: ${data.qualityRating || '?'}/5</p>
    </div>`;
  },
});

// ── Hypothesis ──
CMS.registerEditorComponent({
  id: 'hypothesis',
  label: 'Hypothesis',
  icon: 'lightbulb',
  fields: [
    { name: 'statement', label: 'Hypothesis Statement', widget: 'text' },
    { name: 'rationale', label: 'Background/Rationale', widget: 'text' },
    { name: 'nullH', label: 'Null Hypothesis (H₀)' },
    { name: 'altH', label: 'Alternative Hypothesis (H₁)' },
    { name: 'predictions', label: 'Predictions (one per line)', widget: 'text' },
    { name: 'confounds', label: 'Potential Confounds (one per line)', widget: 'text' },
    { name: 'confidence', label: 'Confidence', widget: 'select', options: ['High', 'Medium', 'Low'] },
  ],
  pattern: /^## Hypothesis\n\n\*\*Statement:\*\* (?<statement>[\s\S]+?)\n\n\*\*Rationale:\*\* (?<rationale>[\s\S]+?)\n\n\*\*H₀ \(Null\):\*\* (?<nullH>[\s\S]+?)\n\n\*\*H₁ \(Alternative\):\*\* (?<altH>[\s\S]+?)\n\n\*\*Predictions:\*\*\n(?<predictions>[\s\S]+?)\n\n\*\*Potential Confounds:\*\*\n(?<confounds>[\s\S]+?)\n\n\*\*Confidence:\*\* (?<confidence>[\s\S]*?)$/m,
  toBlock: ({
    statement = '',
    rationale = '',
    nullH = '',
    altH = '',
    predictions = '',
    confounds = '',
    confidence = '',
  }) => {
    const predictionsList = predictions
      .split('\n')
      .filter(Boolean)
      .map((p, i) => `${i + 1}. ${p}`)
      .join('\n');
    const confoundsList = confounds
      .split('\n')
      .filter(Boolean)
      .map((c) => `- ${c}`)
      .join('\n');

    return `## Hypothesis

**Statement:** ${statement}

**Rationale:** ${rationale}

**H₀ (Null):** ${nullH}

**H₁ (Alternative):** ${altH}

**Predictions:**
${predictionsList || '[Not specified]'}

**Potential Confounds:**
${confoundsList || '[Not specified]'}

**Confidence:** ${confidence || '[Not specified]'}`;
  },
  toPreview: (data) => {
    return `<div style="padding:0.75em 1em;border-left:4px solid #eab308;background:#f8fafc;border-radius:0 4px 4px 0">
      <strong>💡 Hypothesis</strong>
      <p style="margin:0.25em 0 0;color:#666">${data.statement}</p>
    </div>`;
  },
});

// ── Data Collection Log ──
CMS.registerEditorComponent({
  id: 'data-collection',
  label: 'Data Collection Log',
  icon: 'database',
  fields: [
    { name: 'sessionId', label: 'Session ID' },
    { name: 'date', label: 'Date (YYYY-MM-DD)' },
    { name: 'operator', label: 'Operator' },
    { name: 'objective', label: 'Objective', widget: 'text' },
    { name: 'equipment', label: 'Equipment/Software (comma-separated)' },
    { name: 'totalSamples', label: 'Total Samples/Subjects' },
    { name: 'excluded', label: 'Excluded (N, reason)' },
    { name: 'issues', label: 'Issues Encountered', widget: 'text' },
  ],
  pattern: /^## Data Collection Log\n\n\*\*Session:\*\* (?<sessionId>[\s\S]+?) \| \*\*Date:\*\* (?<date>[\s\S]+?) \| \*\*Operator:\*\* (?<operator>[\s\S]+?)\n\n\*\*Objective:\*\* (?<objective>[\s\S]+?)\n\n\*\*Equipment\/Software:\*\* (?<equipment>[\s\S]+?)\n\n\*\*Summary:\*\* Total = (?<totalSamples>[\s\S]+?), Excluded = (?<excluded>[\s\S]+?)\n\n\*\*Issues:\*\* (?<issues>[\s\S]*?)$/m,
  toBlock: ({
    sessionId = '',
    date = '',
    operator = '',
    objective = '',
    equipment = '',
    totalSamples = '',
    excluded = '',
    issues = '',
  }) => {
    return `## Data Collection Log

**Session:** ${sessionId} | **Date:** ${date} | **Operator:** ${operator}

**Objective:** ${objective}

**Equipment/Software:** ${equipment}

**Summary:** Total = ${totalSamples || '?'}, Excluded = ${excluded || 'None'}

**Issues:** ${issues || 'None'}`;
  },
  toPreview: (data) => {
    return `<div style="padding:0.75em 1em;border-left:4px solid #3b82f6;background:#f8fafc;border-radius:0 4px 4px 0">
      <strong>🗄️ Data Collection: ${data.sessionId}</strong>
      <p style="margin:0.25em 0 0;color:#666">${data.date} | ${data.operator}</p>
    </div>`;
  },
});

// ── Error/Troubleshooting ──
CMS.registerEditorComponent({
  id: 'error-troubleshooting',
  label: 'Error / Troubleshooting',
  icon: 'bug_report',
  fields: [
    { name: 'description', label: 'Issue Description', widget: 'text' },
    { name: 'context', label: 'Context (experiment/step/equipment)' },
    { name: 'errorMsg', label: 'Error Message/Output', widget: 'text' },
    { name: 'expected', label: 'Expected Behavior', widget: 'text' },
    { name: 'actual', label: 'Actual Behavior', widget: 'text' },
    { name: 'attempts', label: 'Troubleshooting Attempts (one per line)', widget: 'text' },
    { name: 'resolution', label: 'Resolution', widget: 'text' },
    { name: 'prevention', label: 'Prevention Steps', widget: 'text' },
  ],
  pattern: /^## Troubleshooting: (?<description>.+)\n\n\*\*Context:\*\* (?<context>[\s\S]+?)\n\n\*\*Error:\*\* `(?<errorMsg>[\s\S]*?)`\n\n\*\*Expected:\*\* (?<expected>[\s\S]+?)\n\*\*Actual:\*\* (?<actual>[\s\S]+?)\n\n\*\*Troubleshooting Attempts:\*\*\n(?<attempts>[\s\S]+?)\n\n\*\*Resolution:\*\* (?<resolution>[\s\S]+?)\n\n\*\*Prevention:\*\* (?<prevention>[\s\S]*?)$/m,
  toBlock: ({
    description = '',
    context = '',
    errorMsg = '',
    expected = '',
    actual = '',
    attempts = '',
    resolution = '',
    prevention = '',
  }) => {
    const attemptsList = attempts
      .split('\n')
      .filter(Boolean)
      .map((a, i) => `${i + 1}. ${a}`)
      .join('\n');
    const shortDesc = description.length > 60 ? description.substring(0, 60) + '...' : description;

    return `## Troubleshooting: ${shortDesc}

**Context:** ${context}

**Error:** \`${errorMsg}\`

**Expected:** ${expected}
**Actual:** ${actual}

**Troubleshooting Attempts:**
${attemptsList || '[Not specified]'}

**Resolution:** ${resolution || '[Pending]'}

**Prevention:** ${prevention || '[Not specified]'}`;
  },
  toPreview: (data) => {
    return `<div style="padding:0.75em 1em;border-left:4px solid #ef4444;background:#fef2f2;border-radius:0 4px 4px 0">
      <strong>🐛 Troubleshooting</strong>
      <p style="margin:0.25em 0 0;color:#666">${data.description}</p>
    </div>`;
  },
});

// ── Mice Breeding Log ──
CMS.registerEditorComponent({
  id: 'mice-breeding',
  label: 'Mice Breeding Log',
  icon: 'pets',
  fields: [
    { name: 'cageId', label: 'Cage ID' },
    { name: 'date', label: 'Date (YYYY-MM-DD)' },
    { name: 'strain', label: 'Strain' },
    { name: 'genotype', label: 'Genotype' },
    { name: 'maleId', label: 'Male Mouse ID' },
    { name: 'femaleId', label: 'Female Mouse ID' },
    { name: 'datePaired', label: 'Date Paired' },
    { name: 'plugCheck', label: 'Plug Check Date' },
    { name: 'plugObserved', label: 'Plug Observed?', widget: 'select', options: ['Yes', 'No'] },
    { name: 'litterSize', label: 'Litter Size (if born)' },
    { name: 'dob', label: 'Date of Birth' },
    { name: 'healthMother', label: 'Mother Health Status' },
    { name: 'healthPups', label: 'Pups Health Status' },
    { name: 'interventions', label: 'Interventions Performed' },
    { name: 'weaningDate', label: 'Planned Weaning Date' },
  ],
  pattern: /^## Mice Breeding Log\n\n\*\*Cage:\*\* (?<cageId>[\s\S]+?) \| \*\*Date:\*\* (?<date>[\s\S]+?) \| \*\*Strain:\*\* (?<strain>[\s\S]+?)\n\n\*\*Genotype:\*\* (?<genotype>[\s\S]+?)\n\n\*\*Breeding Pair:\*\* Male (?<maleId>[\s\S]+?) × Female (?<femaleId>[\s\S]+?)\n\n\*\*Mating:\*\* Paired (?<datePaired>[\s\S]+?) \| Plug check (?<plugCheck>[\s\S]+?) \| Plug: (?<plugObserved>[\s\S]+?)\n\n\*\*Litter:\*\* (?<litter>[\s\S]+?)\n\n\*\*Health:\*\* Mother: (?<healthMother>[\s\S]+?) \| Pups: (?<healthPups>[\s\S]+?)\n\n\*\*Interventions:\*\* (?<interventions>[\s\S]+?)\n\n\*\*Planned Weaning:\*\* (?<weaningDate>[\s\S]*?)$/m,
  toBlock: ({
    cageId = '',
    date = '',
    strain = '',
    genotype = '',
    maleId = '',
    femaleId = '',
    datePaired = '',
    plugCheck = '',
    plugObserved = '',
    litterSize = '',
    dob = '',
    healthMother = '',
    healthPups = '',
    interventions = '',
    weaningDate = '',
  }) => {
    const litterInfo = litterSize ? `Born ${dob}, N = ${litterSize}` : 'Not yet born';

    return `## Mice Breeding Log

**Cage:** ${cageId} | **Date:** ${date} | **Strain:** ${strain}

**Genotype:** ${genotype}

**Breeding Pair:** Male ${maleId} × Female ${femaleId}

**Mating:** Paired ${datePaired} | Plug check ${plugCheck} | Plug: ${plugObserved}

**Litter:** ${litterInfo}

**Health:** Mother: ${healthMother} | Pups: ${healthPups}

**Interventions:** ${interventions || 'None'}

**Planned Weaning:** ${weaningDate || '[Not set]'}`;
  },
  toPreview: (data) => {
    return `<div style="padding:0.75em 1em;border-left:4px solid #a855f7;background:#faf5ff;border-radius:0 4px 4px 0">
      <strong>🐭 Mice Breeding: Cage ${data.cageId}</strong>
      <p style="margin:0.25em 0 0;color:#666">${data.strain} | ${data.date}</p>
    </div>`;
  },
});
