#!/usr/bin/env node

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates', 'blocks');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function askMultiLine(prompt) {
  return new Promise((resolve) => {
    console.log(`\n${prompt}`);
    console.log('(Enter each item on a new line. Type "done" on a new line when finished)\n');
    const lines = [];
    const collect = () => {
      rl.question('  > ', (answer) => {
        if (answer.toLowerCase() === 'done') {
          resolve(lines.join('\n'));
        } else {
          lines.push(answer);
          collect();
        }
      });
    };
    collect();
  });
}

async function generateMethodsProtocol() {
  const name = await ask('Protocol name: ');
  const purpose = await ask('Purpose (what is this protocol used for?): ');
  const materials = await askMultiLine('Materials/Reagents (one per line, "done" to finish):');
  const equipment = await askMultiLine('Equipment (one per line, "done" to finish):');
  const procedure = await askMultiLine('Procedure steps (one per line, "done" to finish):');
  const controls = await ask('Controls (positive and negative, comma-separated): ');
  const expectedResults = await ask('Expected results: ');
  const modifications = await ask('Any modifications from standard protocol: ');

  const materialsList = materials.split('\n').map((m) => `- ${m}`).join('\n');
  const equipmentList = equipment.split('\n').map((e) => `- ${e}`).join('\n');
  const steps = procedure.split('\n').map((s, i) => `${i + 1}. ${s}`).join('\n');
  const controlsList = controls.split(',').map((c) => c.trim());

  return `## Protocol: ${name}

**Purpose:** ${purpose}

**Materials/Reagents:**
${materialsList || '- [Not specified]'}

**Equipment:**
${equipmentList || '- [Not specified]'}

**Procedure:**
${steps || '[Not specified]'}

**Controls:**
- Positive control: ${controlsList[0] || '[Not specified]'}
- Negative control: ${controlsList[1] || '[Not specified]'}

**Expected Results:** ${expectedResults || '[Not specified]'}

**Modifications:** ${modifications || 'None from standard protocol'}`;
}

async function generateResultsSummary() {
  const experiment = await ask('Experiment/Analysis name: ');
  const date = await ask('Date conducted (YYYY-MM-DD): ');
  const sampleSize = await ask('Sample size (N = ?): ');
  const findings = await askMultiLine('Key findings (one per line, "done" to finish):');
  const interpretation = await ask('Interpretation (what do these results mean?): ');
  const limitations = await ask('Limitations: ');
  const nextSteps = await askMultiLine('Next steps (one per line, "done" to finish):');

  const findingsList = findings.split('\n').map((f, i) => `${i + 1}. ${f}`).join('\n');
  const nextStepsList = nextSteps.split('\n').map((s) => `- [ ] ${s}`).join('\n');

  return `## Results Summary: ${experiment}

**Date:** ${date || '[Not specified]'} | **Sample Size:** N = ${sampleSize || '?'}

**Key Findings:**
${findingsList || '[Not specified]'}

**Interpretation:** ${interpretation || '[Not specified]'}

**Limitations:** ${limitations || '[Not specified]'}

**Next Steps:**
${nextStepsList || '- [ ] [Not specified]'}`;
}

async function generateLiteratureReview() {
  const citation = await ask('Citation (Author, Year, Title, Journal): ');
  const researchQuestion = await ask('Research question addressed: ');
  const methods = await ask('Methods (brief summary): ');
  const findings = await askMultiLine('Key findings (one per line, "done" to finish):');
  const relevance = await ask('Relevance to your work: ');
  const strengths = await askMultiLine('Strengths (one per line, "done" to finish):');
  const limitations = await askMultiLine('Limitations (one per line, "done" to finish):');
  const ideas = await askMultiLine('Ideas/questions raised (one per line, "done" to finish):');
  const relevanceRating = await ask('Relevance rating (1-5): ');
  const qualityRating = await ask('Quality rating (1-5): ');

  const findingsList = findings.split('\n').map((f, i) => `${i + 1}. ${f}`).join('\n');
  const strengthsList = strengths.split('\n').map((s) => `- ${s}`).join('\n');
  const limitationsList = limitations.split('\n').map((l) => `- ${l}`).join('\n');
  const ideasList = ideas.split('\n').map((i) => `- ${i}`).join('\n');

  return `## Literature: ${citation}

**Research Question:** ${researchQuestion}

**Methods:** ${methods}

**Key Findings:**
${findingsList || '[Not specified]'}

**Relevance to My Work:** ${relevance}

**Strengths:**
${strengthsList || '- [Not specified]'}

**Limitations:**
${limitationsList || '- [Not specified]'}

**Ideas/Questions Raised:**
${ideasList || '- [Not specified]'}

**Rating:** Relevance: ${relevanceRating || '?'}/5 | Quality: ${qualityRating || '?'}/5`;
}

async function generateHypothesis() {
  const statement = await ask('Hypothesis statement: ');
  const rationale = await ask('Background/rationale: ');
  const nullH = await ask('Null hypothesis (H₀): ');
  const altH = await ask('Alternative hypothesis (H₁): ');
  const predictions = await askMultiLine('Predictions (one per line, "done" to finish):');
  const confounds = await askMultiLine('Potential confounds (one per line, "done" to finish):');
  const confidence = await ask('Confidence level (High/Medium/Low): ');

  const predictionsList = predictions.split('\n').map((p, i) => `${i + 1}. ${p}`).join('\n');
  const confoundsList = confounds.split('\n').map((c) => `- ${c}`).join('\n');

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
}

async function generateDataCollection() {
  const sessionId = await ask('Session ID: ');
  const date = await ask('Date (YYYY-MM-DD): ');
  const operator = await ask('Operator: ');
  const objective = await ask('Objective: ');
  const equipment = await ask('Equipment/Software used (comma-separated): ');
  const totalSamples = await ask('Total samples/subjects: ');
  const excluded = await ask('Excluded (N, reason): ');
  const issues = await ask('Issues encountered: ');

  return `## Data Collection Log

**Session:** ${sessionId} | **Date:** ${date} | **Operator:** ${operator}

**Objective:** ${objective}

**Equipment/Software:** ${equipment}

**Summary:** Total = ${totalSamples || '?'}, Excluded = ${excluded || 'None'}

**Issues:** ${issues || 'None'}`;
}

async function generateErrorTroubleshooting() {
  const description = await ask('Issue description: ');
  const context = await ask('Context (experiment/step/equipment): ');
  const errorMsg = await ask('Error message or unexpected output: ');
  const expected = await ask('Expected behavior: ');
  const actual = await ask('Actual behavior: ');
  const attempts = await askMultiLine('Troubleshooting attempts (one per line, "done" to finish):');
  const resolution = await ask('Resolution (if found): ');
  const prevention = await ask('Prevention steps for future: ');

  const attemptsList = attempts.split('\n').map((a, i) => `${i + 1}. ${a}`).join('\n');

  return `## Troubleshooting: ${description.substring(0, 60)}${description.length > 60 ? '...' : ''}

**Context:** ${context}

**Error:** \`${errorMsg}\`

**Expected:** ${expected}
**Actual:** ${actual}

**Troubleshooting Attempts:**
${attemptsList || '[Not specified]'}

**Resolution:** ${resolution || '[Pending]'}

**Prevention:** ${prevention || '[Not specified]'}`;
}

async function generateMiceBreeding() {
  const cageId = await ask('Cage ID: ');
  const date = await ask('Date (YYYY-MM-DD): ');
  const strain = await ask('Strain: ');
  const genotype = await ask('Genotype: ');
  const maleId = await ask('Male mouse ID: ');
  const femaleId = await ask('Female mouse ID: ');
  const datePaired = await ask('Date paired: ');
  const plugCheck = await ask('Plug check date: ');
  const plugObserved = await ask('Plug observed? (Yes/No): ');
  const litterSize = await ask('Litter size (if born, else leave blank): ');
  const dob = await ask('Date of birth (if applicable): ');
  const healthMother = await ask('Mother health status: ');
  const healthPups = await ask('Pups health status: ');
  const interventions = await ask('Interventions performed: ');
  const weaningDate = await ask('Planned weaning date: ');

  return `## Mice Breeding Log

**Cage:** ${cageId} | **Date:** ${date} | **Strain:** ${strain}

**Genotype:** ${genotype}

**Breeding Pair:** Male ${maleId} × Female ${femaleId}

**Mating:** Paired ${datePaired} | Plug check ${plugCheck} | Plug: ${plugObserved}

**Litter:** ${litterSize ? `Born ${dob}, N = ${litterSize}` : 'Not yet born'}

**Health:** Mother: ${healthMother} | Pups: ${healthPups}

**Interventions:** ${interventions || 'None'}

**Planned Weaning:** ${weaningDate || '[Not set]'}`;
}

const BLOCK_TYPES = {
  '1': { label: 'Methods/Protocol', generator: generateMethodsProtocol },
  '2': { label: 'Results Summary', generator: generateResultsSummary },
  '3': { label: 'Literature Review', generator: generateLiteratureReview },
  '4': { label: 'Hypothesis', generator: generateHypothesis },
  '5': { label: 'Data Collection Log', generator: generateDataCollection },
  '6': { label: 'Error/Troubleshooting', generator: generateErrorTroubleshooting },
  '7': { label: 'Mice Breeding Log', generator: generateMiceBreeding },
};

async function main() {
  console.log('\n=== PhD Lab Notes — Block Generator ===\n');
  console.log('Select a block type to generate:\n');

  for (const [key, { label }] of Object.entries(BLOCK_TYPES)) {
    console.log(`  ${key}. ${label}`);
  }
  console.log('  q. Quit\n');

  const choice = await ask('Choice > ');

  if (choice.toLowerCase() === 'q') {
    rl.close();
    return;
  }

  const blockType = BLOCK_TYPES[choice];
  if (!blockType) {
    console.log(`\nInvalid choice: ${choice}`);
    rl.close();
    return;
  }

  console.log(`\n--- Generating ${blockType.label} block ---\n`);
  const block = await blockType.generator();

  const outputPath = path.join(TEMPLATES_DIR, `generated-${Date.now()}.md`);
  fs.writeFileSync(outputPath, block, 'utf-8');

  console.log('\n✅ Generated block saved to:');
  console.log(`   ${outputPath}\n`);
  console.log('─── Generated Content ───');
  console.log(block);
  console.log('\n─────────────────────────\n');

  const copyAgain = await ask('Generate another block? (y/n) > ');
  if (copyAgain.toLowerCase() === 'y') {
    await main();
  } else {
    rl.close();
  }
}

main().catch((err) => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
