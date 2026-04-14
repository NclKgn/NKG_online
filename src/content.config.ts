// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// ── Markdown collections (glob) ──

const newsletter = defineCollection({
  loader: glob({ base: './src/content/newsletter', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['ongoing', 'completed', 'upcoming']),
    domain: z.array(z.enum(['research', 'clinical', 'engineering'])),
    summary: z.string(),
    collaborators: z.array(z.string()).default([]),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const misc = defineCollection({
  loader: glob({ base: './src/content/misc', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    date: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

// ── YAML data collections (file) ──

const cv = defineCollection({
  loader: file('./src/data/cv.yaml'),
  schema: z.object({
    section: z.enum(['education', 'clinical', 'research', 'skills']),
    year: z.string(),
    title: z.string(),
    institution: z.string(),
    description: z.string(),
  }),
});

const stack = defineCollection({
  loader: file('./src/data/stack.yaml'),
  schema: z.object({
    layer: z.string(),
    methods: z.string(),
    tools: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

const labs = defineCollection({
  loader: file('./src/data/labs.yaml'),
  schema: z.object({
    name: z.string(),
    pi: z.string(),
    institution: z.string(),
    role: z.string(),
    work: z.string(),
    url: z.string().optional(),
  }),
});

const phdProgress = defineCollection({
  loader: file('./src/data/phd-progress.yaml'),
  schema: z.object({
    label: z.string(),
    value: z.number(),
    color: z.string().optional(),
  }),
});

const hero = defineCollection({
  loader: file('./src/data/hero.yaml'),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
  }),
});

const timeline = defineCollection({
  loader: file('./src/data/timeline.yaml'),
  schema: z.object({
    entries: z.array(z.object({
      id: z.string(),
      date: z.coerce.date(),
      label: z.string(),
      type: z.enum(['milestone', 'publication', 'experiment', 'committee']),
      status: z.enum(['done', 'upcoming']),
    })),
  }),
});

const thesis = defineCollection({
  loader: file('./src/data/thesis.yaml'),
  schema: z.object({
    chapters: z.array(z.object({
      id: z.string(),
      title: z.string(),
      status: z.enum(['non-demarre', 'en-cours', 'termine']),
      value: z.number().min(0).max(100),
      deadline: z.coerce.date().optional(),
    })),
    publications: z.array(z.object({
      id: z.string(),
      title: z.string(),
      journal: z.string(),
      status: z.enum(['planifie', 'en-preparation', 'soumis', 'en-revision', 'accepte', 'publie']),
      deadline: z.coerce.date().optional(),
    })),
    milestones: z.array(z.object({
      id: z.string(),
      title: z.string(),
      date: z.coerce.date(),
      status: z.enum(['done', 'upcoming']),
    })),
  }),
});

const collecte = defineCollection({
  loader: file('./src/data/collecte.yaml'),
  schema: z.object({
    partie: z.enum(['biologie', 'biomecanique', 'donnees-humaines']),
    label: z.string(),
    statut: z.enum(['non-demarre', 'en-cours', 'termine']),
    value: z.number().min(0).max(100),
    deadline: z.coerce.date().optional(),
    notes: z.string().optional(),
    color: z.string().optional(),
  }),
});

const visibility = defineCollection({
  loader: file('./src/data/visibility.yaml'),
  schema: z.union([
    z.boolean(),                                   // rétrocompat
    z.enum(['public', 'guest', 'private']),        // nouveau
  ]),
});

// ── Experiments (structured PhD experiments) ──

const experiments = defineCollection({
  loader: glob({ base: './src/content/experiments', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    status: z.enum(['planned', 'ongoing', 'completed']).default('planned'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Identification
    context: z.string().optional(),
    // Planification
    objective: z.string().optional(),
    hypothesis_main: z.string().optional(),
    hypothesis_null: z.string().optional(),
    independent_vars: z.string().optional(),
    dependent_vars: z.string().optional(),
    controlled_vars: z.string().optional(),
    protocol: z.string().optional(),
    vigilance_points: z.string().optional(),
    // Exécution
    logbook: z.string().optional(),
    raw_data: z.string().optional(),
    problems: z.string().optional(),
    // Analyse
    if_h1: z.string().optional(),
    if_h0: z.string().optional(),
    if_mixed: z.string().optional(),
    interpretation: z.string().optional(),
    literature: z.string().optional(),
    // Suites & méta
    next_actions: z.string().optional(),
    links: z.string().optional(),
  }),
});

// ── Private collections (lab notebook, meetings) ──

const labEntries = defineCollection({
  loader: glob({ base: './src/content/lab-entries', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const meetings = defineCollection({
  loader: glob({ base: './src/content/meetings', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    attendees: z.array(z.string()).default([]),
    decisions: z.array(z.string()).default([]),
    actions: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const figures = defineCollection({
  loader: file('./src/data/figures.yaml'),
  schema: z.object({
    figures: z.array(z.object({
      id: z.string(),
      title: z.string(),
      target: z.enum(['article-1', 'article-2', 'article-scoping', 'thesis']),
      chapter: z.string(),
      status: z.enum(['brouillon', 'finalisee', 'a-refaire']),
      source_experiment: z.string().optional(),
      auto_generated: z.boolean().optional(),
      last_updated: z.coerce.date(),
      notes: z.string().optional(),
    })),
  }),
});

const specimens = defineCollection({
  loader: file('./src/data/specimens.yaml'),
  schema: z.object({
    generated_at: z.string().nullable().optional(),
    count: z.number(),
    specimens: z.array(z.object({
      code: z.string(),
      stage: z.enum(['E14_5', 'E16_5', 'P0', 'P1', 'P14', 'OTHER']),
      genotype: z.enum(['WT', 'HET', 'HOMO', 'UNKNOWN']),
      sex: z.string().optional(),
      litter: z.string().optional(),
      sacrifice_date: z.string().optional(),
      status: z.enum(['ACTIVE', 'LOST', 'EXCLUDED', 'ARCHIVED']),
      status_note: z.string().optional(),
      notes: z.string().optional(),
    })),
  }),
});

const defense = defineCollection({
  loader: file('./src/data/defense.yaml'),
  schema: z.object({
    target_date: z.string(),
    steps: z.array(z.object({
      id: z.string(),
      label: z.string(),
      category: z.enum(['admin', 'jury', 'manuscrit']),
      status: z.enum(['done', 'upcoming', 'pending']),
      date: z.string().optional(),
      deadline: z.string().optional(),
    })),
  }),
});

const experimentsLive = defineCollection({
  loader: file('./src/data/experiments-live.yaml'),
  schema: z.object({
    generated_at: z.string().nullable().optional(),
    count: z.number(),
    experiments: z.array(z.object({
      code: z.string(),
      type: z.enum(['EX_VIVO', 'IF', 'RNASCOPE', 'LIGHTSHEET', 'ANALYSIS', 'RNASEQ']),
      title: z.string().optional(),
      date_start: z.string(),
      date_end: z.string().optional().nullable(),
      status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED']),
      samples: z.array(z.string()).optional(),
      notes: z.string().optional(),
      params: z.record(z.unknown()).optional(),
    })),
  }),
});

const pipelineStep = z.object({
  type: z.enum(['acquisition', 'preprocessing', 'analysis', 'figure']),
  label: z.string(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']),
});

const pipelinesData = defineCollection({
  loader: file('./src/data/pipelines.yaml'),
  schema: z.object({
    generated_at: z.string().nullable().optional(),
    count: z.number(),
    pipelines: z.array(z.object({
      id: z.string(),
      name: z.string(),
      status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']),
      axis: z.enum(['biologie', 'biomecanique', 'donnees-humaines']),
      steps: z.array(pipelineStep),
      experiments: z.array(z.string()).optional(),
      figures: z.array(z.string()).optional(),
      notes: z.string().optional(),
    })),
  }),
});

const datasetsData = defineCollection({
  loader: file('./src/data/datasets.yaml'),
  schema: z.object({
    datasets: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['imaging', 'rna-seq', 'morphometrics', 'clinical', 'other']),
      size: z.string().optional(),
      linked_article: z.enum(['article-1', 'article-2', 'article-scoping', 'thesis']).optional(),
      backup: z.object({
        local: z.boolean(),
        remote: z.string().nullable().optional(),
        cloud: z.boolean(),
        last_backup_date: z.string().optional(),
      }),
      sharing: z.object({
        repository: z.string().nullable().optional(),
        accession: z.string().nullable().optional(),
        status: z.enum(['not-deposited', 'in-preparation', 'deposited', 'public']),
      }),
      fair: z.object({
        findable:     z.boolean(),
        accessible:   z.boolean(),
        interoperable:z.boolean(),
        reusable:     z.boolean(),
      }),
      notes: z.string().optional(),
    })),
  }),
});

export const collections = {
  newsletter,
  projects,
  misc,
  cv,
  stack,
  labs,
  hero,
  'phd-progress': phdProgress,
  'lab-entries': labEntries,
  meetings,
  experiments,
  collecte,
  thesis,
  timeline,
  figures,
  specimens,
  'experiments-live': experimentsLive,
  'pipelines-data': pipelinesData,
  'datasets-data': datasetsData,
  defense,
  visibility,
};
