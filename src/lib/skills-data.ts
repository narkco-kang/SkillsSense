/**
 * In-memory skills dataset (MVP).
 * Auto-merged from obra/superpowers + ~/.hermes/skills local library.
 * Later: replace with Supabase + pgvector.
 */

export type Skill = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  whenToUse: string;
  source: string;
  url: string;
  path?: string;
  generatedFrom?: string[];  // For AI-generated skills
};

export const SKILLS: Skill[] = [
  {
    "id": "himalaya",
    "name": "Himalaya",
    "category": "email",
    "description": "CLI to manage emails via IMAP/SMTP. Use himalaya to list, read, write, reply, forward, search, and organize emails from the terminal. Supports multiple accounts and message composition with MML (MIME Meta Language).",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "email/himalaya/SKILL.md",
    "tags": [
      "email",
      "cli",
      "manage",
      "emails",
      "imap",
      "smtp",
      "himalaya"
    ],
    "whenToUse": "CLI to manage emails via IMAP/SMTP."
  },
  {
    "id": "minecraft-modpack-server",
    "name": "Minecraft Modpack Server",
    "category": "gaming",
    "description": "Set up a modded Minecraft server from a CurseForge/Modrinth server pack zip. Covers NeoForge/Forge install, Java version, JVM tuning, firewall, LAN config, backups, and launch scripts.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "gaming/minecraft-modpack-server/SKILL.md",
    "tags": [
      "gaming",
      "set",
      "modded",
      "minecraft",
      "server",
      "curseforge",
      "modrinth"
    ],
    "whenToUse": "Set up a modded Minecraft server from a CurseForge/Modrinth server pack zip."
  },
  {
    "id": "pokemon-player",
    "name": "Pokemon Player",
    "category": "gaming",
    "description": "Play Pokemon games autonomously via headless emulation. Starts a game server, reads structured game state from RAM, makes strategic decisions, and sends button inputs — all from the terminal.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "gaming/pokemon-player/SKILL.md",
    "tags": [
      "gaming",
      "play",
      "pokemon",
      "games",
      "autonomously",
      "headless",
      "emulation"
    ],
    "whenToUse": "Play Pokemon games autonomously via headless emulation."
  },
  {
    "id": "huggingface-hub",
    "name": "Huggingface Hub",
    "category": "mlops",
    "description": "Hugging Face Hub CLI (hf) — search, download, and upload models and datasets, manage repos, query datasets with SQL, deploy inference endpoints, manage Spaces and buckets.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/huggingface-hub/SKILL.md",
    "tags": [
      "mlops",
      "hugging",
      "face",
      "hub",
      "cli",
      "search",
      "download"
    ],
    "whenToUse": "Hugging Face Hub CLI (hf) — search, download, and upload models and datasets, manage repos, query datasets with SQL, deploy inference endpoints, manage Spaces and buckets."
  },
  {
    "id": "modal-serverless-gpu",
    "name": "Modal Serverless Gpu",
    "category": "mlops/cloud",
    "description": "Serverless GPU cloud platform for running ML workloads. Use when you need on-demand GPU access without infrastructure management, deploying ML models as APIs, or running batch jobs with automatic scaling.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/cloud/modal/SKILL.md",
    "tags": [
      "serverless",
      "gpu",
      "cloud",
      "platform",
      "running",
      "workloads"
    ],
    "whenToUse": "Serverless GPU cloud platform for running ML workloads."
  },
  {
    "id": "evaluating-llms-harness",
    "name": "Evaluating Llms Harness",
    "category": "mlops/evaluation",
    "description": "Evaluates LLMs across 60+ academic benchmarks (MMLU, HumanEval, GSM8K, TruthfulQA, HellaSwag). Use when benchmarking model quality, comparing models, reporting academic results, or tracking training progress. Industry standard used by EleutherAI, HuggingFace, and major labs. Supports HuggingFace, vLLM, APIs.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/evaluation/lm-evaluation-harness/SKILL.md",
    "tags": [
      "evaluation",
      "evaluates",
      "llms",
      "across",
      "academic",
      "benchmarks",
      "mmlu"
    ],
    "whenToUse": "Evaluates LLMs across 60+ academic benchmarks (MMLU, HumanEval, GSM8K, TruthfulQA, HellaSwag)."
  },
  {
    "id": "weights-and-biases",
    "name": "Weights And Biases",
    "category": "mlops/evaluation",
    "description": "Track ML experiments with automatic logging, visualize training in real-time, optimize hyperparameters with sweeps, and manage model registry with W&B - collaborative MLOps platform",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/evaluation/weights-and-biases/SKILL.md",
    "tags": [
      "evaluation",
      "track",
      "experiments",
      "automatic",
      "logging",
      "visualize",
      "training"
    ],
    "whenToUse": "Track ML experiments with automatic logging, visualize training in real-time, optimize hyperparameters with sweeps, and manage model registr"
  },
  {
    "id": "gguf-quantization",
    "name": "Gguf Quantization",
    "category": "mlops/inference",
    "description": "GGUF format and llama.cpp quantization for efficient CPU/GPU inference. Use when deploying models on consumer hardware, Apple Silicon, or when needing flexible quantization from 2-8 bit without GPU requirements.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/inference/gguf/SKILL.md",
    "tags": [
      "inference",
      "gguf",
      "format",
      "llama",
      "cpp",
      "quantization",
      "efficient"
    ],
    "whenToUse": "GGUF format and llama."
  },
  {
    "id": "guidance",
    "name": "Guidance",
    "category": "mlops/inference",
    "description": "Control LLM output with regex and grammars, guarantee valid JSON/XML/code generation, enforce structured formats, and build multi-step workflows with Guidance - Microsoft Research's constrained generation framework",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/inference/guidance/SKILL.md",
    "tags": [
      "inference",
      "control",
      "llm",
      "output",
      "regex",
      "grammars",
      "guarantee"
    ],
    "whenToUse": "Control LLM output with regex and grammars, guarantee valid JSON/XML/code generation, enforce structured formats, and build multi-step workf"
  },
  {
    "id": "obliteratus",
    "name": "Obliteratus",
    "category": "mlops/inference",
    "description": "Remove refusal behaviors from open-weight LLMs using OBLITERATUS — mechanistic interpretability techniques (diff-in-means, SVD, whitened SVD, LEACE, SAE decomposition, etc.) to excise guardrails while preserving reasoning. 9 CLI methods, 28 analysis modules, 116 model presets across 5 compute tiers, tournament evaluation, and telemetry-driven recommendations. Use when a user wants to uncensor, abl",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/inference/obliteratus/SKILL.md",
    "tags": [
      "inference",
      "remove",
      "refusal",
      "behaviors",
      "open-weight",
      "llms",
      "obliteratus"
    ],
    "whenToUse": "Remove refusal behaviors from open-weight LLMs using OBLITERATUS — mechanistic interpretability techniques (diff-in-means, SVD, whitened SVD, LEACE, SAE decomposition, etc."
  },
  {
    "id": "outlines",
    "name": "Outlines",
    "category": "mlops/inference",
    "description": "Guarantee valid JSON/XML/code structure during generation, use Pydantic models for type-safe outputs, support local models (Transformers, vLLM), and maximize inference speed with Outlines - dottxt.ai's structured generation library",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/inference/outlines/SKILL.md",
    "tags": [
      "inference",
      "guarantee",
      "valid",
      "json",
      "xml",
      "code",
      "structure"
    ],
    "whenToUse": "Guarantee valid JSON/XML/code structure during generation, use Pydantic models for type-safe outputs, support local models (Transformers, vLLM), and maximize inference speed with Outlines - dottxt."
  },
  {
    "id": "serving-llms-vllm",
    "name": "Serving Llms Vllm",
    "category": "mlops/inference",
    "description": "Serves LLMs with high throughput using vLLM's PagedAttention and continuous batching. Use when deploying production LLM APIs, optimizing inference latency/throughput, or serving models with limited GPU memory. Supports OpenAI-compatible endpoints, quantization (GPTQ/AWQ/FP8), and tensor parallelism.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/inference/vllm/SKILL.md",
    "tags": [
      "inference",
      "serves",
      "llms",
      "high",
      "throughput",
      "vllm",
      "pagedattention"
    ],
    "whenToUse": "Serves LLMs with high throughput using vLLM's PagedAttention and continuous batching."
  },
  {
    "id": "audiocraft-audio-generation",
    "name": "Audiocraft Audio Generation",
    "category": "mlops/models",
    "description": "PyTorch library for audio generation including text-to-music (MusicGen) and text-to-sound (AudioGen). Use when you need to generate music from text descriptions, create sound effects, or perform melody-conditioned music generation.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/models/audiocraft/SKILL.md",
    "tags": [
      "models",
      "pytorch",
      "library",
      "audio",
      "generation",
      "including",
      "text-to-music"
    ],
    "whenToUse": "PyTorch library for audio generation including text-to-music (MusicGen) and text-to-sound (AudioGen)."
  },
  {
    "id": "clip",
    "name": "Clip",
    "category": "mlops/models",
    "description": "OpenAI's model connecting vision and language. Enables zero-shot image classification, image-text matching, and cross-modal retrieval. Trained on 400M image-text pairs. Use for image search, content moderation, or vision-language tasks without fine-tuning. Best for general-purpose image understanding.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/models/clip/SKILL.md",
    "tags": [
      "models",
      "openai",
      "model",
      "connecting",
      "vision",
      "language",
      "enables"
    ],
    "whenToUse": "OpenAI's model connecting vision and language."
  },
  {
    "id": "segment-anything-model",
    "name": "Segment Anything Model",
    "category": "mlops/models",
    "description": "Foundation model for image segmentation with zero-shot transfer. Use when you need to segment any object in images using points, boxes, or masks as prompts, or automatically generate all object masks in an image.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/models/segment-anything/SKILL.md",
    "tags": [
      "models",
      "foundation",
      "model",
      "image",
      "segmentation",
      "zero-shot",
      "transfer"
    ],
    "whenToUse": "Foundation model for image segmentation with zero-shot transfer."
  },
  {
    "id": "stable-diffusion-image-generation",
    "name": "Stable Diffusion Image Generation",
    "category": "mlops/models",
    "description": "State-of-the-art text-to-image generation with Stable Diffusion models via HuggingFace Diffusers. Use when generating images from text prompts, performing image-to-image translation, inpainting, or building custom diffusion pipelines.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/models/stable-diffusion/SKILL.md",
    "tags": [
      "state-of-the-art",
      "text-to-image",
      "generation",
      "stable",
      "diffusion",
      "models"
    ],
    "whenToUse": "State-of-the-art text-to-image generation with Stable Diffusion models via HuggingFace Diffusers."
  },
  {
    "id": "whisper",
    "name": "Whisper",
    "category": "mlops/models",
    "description": "OpenAI's general-purpose speech recognition model. Supports 99 languages, transcription, translation to English, and language identification. Six model sizes from tiny (39M params) to large (1550M params). Use for speech-to-text, podcast transcription, or multilingual audio processing. Best for robust, multilingual ASR.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/models/whisper/SKILL.md",
    "tags": [
      "models",
      "openai",
      "general-purpose",
      "speech",
      "recognition",
      "model",
      "supports"
    ],
    "whenToUse": "OpenAI's general-purpose speech recognition model."
  },
  {
    "id": "dspy",
    "name": "Dspy",
    "category": "mlops/research",
    "description": "Build complex AI systems with declarative programming, optimize prompts automatically, create modular RAG systems and agents with DSPy - Stanford NLP's framework for systematic LM programming",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/research/dspy/SKILL.md",
    "tags": [
      "research",
      "build",
      "complex",
      "systems",
      "declarative",
      "programming",
      "optimize"
    ],
    "whenToUse": "Build complex AI systems with declarative programming, optimize prompts automatically, create modular RAG systems and agents with DSPy - Sta"
  },
  {
    "id": "axolotl",
    "name": "Axolotl",
    "category": "mlops/training",
    "description": "Expert guidance for fine-tuning LLMs with Axolotl - YAML configs, 100+ models, LoRA/QLoRA, DPO/KTO/ORPO/GRPO, multimodal support",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/training/axolotl/SKILL.md",
    "tags": [
      "training",
      "expert",
      "guidance",
      "fine-tuning",
      "llms",
      "axolotl",
      "yaml"
    ],
    "whenToUse": "Expert guidance for fine-tuning LLMs with Axolotl - YAML configs, 100+ models, LoRA/QLoRA, DPO/KTO/ORPO/GRPO, multimodal support"
  },
  {
    "id": "fine-tuning-with-trl",
    "name": "Fine Tuning With Trl",
    "category": "mlops/training",
    "description": "Fine-tune LLMs using reinforcement learning with TRL - SFT for instruction tuning, DPO for preference alignment, PPO/GRPO for reward optimization, and reward model training. Use when need RLHF, align model with preferences, or train from human feedback. Works with HuggingFace Transformers.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/training/trl-fine-tuning/SKILL.md",
    "tags": [
      "training",
      "fine-tune",
      "llms",
      "reinforcement",
      "learning",
      "trl",
      "sft"
    ],
    "whenToUse": "Fine-tune LLMs using reinforcement learning with TRL - SFT for instruction tuning, DPO for preference alignment, PPO/GRPO for reward optimization, and reward model training."
  },
  {
    "id": "grpo-rl-training",
    "name": "Grpo Rl Training",
    "category": "mlops/training",
    "description": "Expert guidance for GRPO/RL fine-tuning with TRL for reasoning and task-specific model training",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/training/grpo-rl-training/SKILL.md",
    "tags": [
      "training",
      "expert",
      "guidance",
      "grpo",
      "fine-tuning",
      "trl",
      "reasoning"
    ],
    "whenToUse": "Expert guidance for GRPO/RL fine-tuning with TRL for reasoning and task-specific model training"
  },
  {
    "id": "peft-fine-tuning",
    "name": "Peft Fine Tuning",
    "category": "mlops/training",
    "description": "Parameter-efficient fine-tuning for LLMs using LoRA, QLoRA, and 25+ methods. Use when fine-tuning large models (7B-70B) with limited GPU memory, when you need to train <1% of parameters with minimal accuracy loss, or for multi-adapter serving. HuggingFace's official library integrated with transformers ecosystem.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/training/peft/SKILL.md",
    "tags": [
      "training",
      "parameter-efficient",
      "fine-tuning",
      "llms",
      "lora",
      "qlora",
      "methods"
    ],
    "whenToUse": "Parameter-efficient fine-tuning for LLMs using LoRA, QLoRA, and 25+ methods."
  },
  {
    "id": "pytorch-fsdp",
    "name": "Pytorch Fsdp",
    "category": "mlops/training",
    "description": "Expert guidance for Fully Sharded Data Parallel training with PyTorch FSDP - parameter sharding, mixed precision, CPU offloading, FSDP2",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/training/pytorch-fsdp/SKILL.md",
    "tags": [
      "training",
      "expert",
      "guidance",
      "fully",
      "sharded",
      "data",
      "parallel"
    ],
    "whenToUse": "Expert guidance for Fully Sharded Data Parallel training with PyTorch FSDP - parameter sharding, mixed precision, CPU offloading, FSDP2"
  },
  {
    "id": "unsloth",
    "name": "Unsloth",
    "category": "mlops/training",
    "description": "Expert guidance for fast fine-tuning with Unsloth - 2-5x faster training, 50-80% less memory, LoRA/QLoRA optimization",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "mlops/training/unsloth/SKILL.md",
    "tags": [
      "training",
      "expert",
      "guidance",
      "fast",
      "fine-tuning",
      "unsloth",
      "faster"
    ],
    "whenToUse": "Expert guidance for fast fine-tuning with Unsloth - 2-5x faster training, 50-80% less memory, LoRA/QLoRA optimization"
  },
  {
    "id": "godmode",
    "name": "Godmode",
    "category": "red-teaming",
    "description": "Jailbreak API-served LLMs using G0DM0D3 techniques — Parseltongue input obfuscation (33 techniques), GODMODE CLASSIC system prompt templates, ULTRAPLINIAN multi-model racing, encoding escalation, and Hermes-native prefill/system prompt integration. Use when a user wants to bypass safety filters, jailbreak a model, or red-team model robustness.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "red-teaming/godmode/SKILL.md",
    "tags": [
      "red-teaming",
      "jailbreak",
      "api-served",
      "llms",
      "techniques",
      "parseltongue",
      "input"
    ],
    "whenToUse": "Jailbreak API-served LLMs using G0DM0D3 techniques — Parseltongue input obfuscation (33 techniques), GODMODE CLASSIC system prompt templates"
  },
  {
    "id": "openhue",
    "name": "Openhue",
    "category": "smart-home",
    "description": "Control Philips Hue lights, rooms, and scenes via the OpenHue CLI. Turn lights on/off, adjust brightness, color, color temperature, and activate scenes.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "smart-home/openhue/SKILL.md",
    "tags": [
      "smart-home",
      "control",
      "philips",
      "hue",
      "lights",
      "rooms",
      "scenes"
    ],
    "whenToUse": "Control Philips Hue lights, rooms, and scenes via the OpenHue CLI."
  },
  {
    "id": "ai-engineer",
    "name": "AI Engineer",
    "category": "software-development",
    "description": "Expert AI/ML engineer specializing in machine learning model development, deployment, and integration into production systems. Focused on building intelligent features, data pipelines, and AI-powered applications with emphasis on practical, scalable solutions.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers/tree/main/software-development/ai-engineer/SKILL.md",
    "path": "software-development/ai-engineer/SKILL.md",
    "tags": [
      "software-development",
      "expert",
      "engineer",
      "specializing",
      "machine",
      "learning",
      "model"
    ],
    "whenToUse": "Expert AI/ML engineer specializing in machine learning model development, deployment, and integration into production systems."
  },
  {
    "id": "brainstorming",
    "name": "Brainstorming",
    "category": "software-development",
    "description": "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.",
    "source": "superpowers + hermes",
    "url": "https://github.com/obra/superpowers/tree/main/skills/brainstorming/SKILL.md",
    "path": "software-development/brainstorming/SKILL.md",
    "tags": [
      "software-development",
      "must",
      "creative",
      "work",
      "creating",
      "features",
      "building"
    ],
    "whenToUse": "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior."
  },
  {
    "id": "code-reviewer",
    "name": "Code Reviewer",
    "category": "software-development",
    "description": "Expert code reviewer who provides constructive, actionable feedback focused on correctness, maintainability, security, and performance — not style preferences.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers/tree/main/software-development/code-reviewer/SKILL.md",
    "path": "software-development/code-reviewer/SKILL.md",
    "tags": [
      "software-development",
      "expert",
      "code",
      "reviewer",
      "who",
      "provides",
      "constructive"
    ],
    "whenToUse": "Expert code reviewer who provides constructive, actionable feedback focused on correctness, maintainability, security, and performance — not style preferences."
  },
  {
    "id": "database-optimizer",
    "name": "Database Optimizer",
    "category": "software-development",
    "description": "Expert database specialist focusing on schema design, query optimization, indexing strategies, and performance tuning for PostgreSQL, MySQL, and modern databases like Supabase and PlanetScale.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers/tree/main/software-development/database-optimizer/SKILL.md",
    "path": "software-development/database-optimizer/SKILL.md",
    "tags": [
      "software-development",
      "expert",
      "database",
      "specialist",
      "focusing",
      "schema",
      "design"
    ],
    "whenToUse": "Expert database specialist focusing on schema design, query optimization, indexing strategies, and performance tuning for PostgreSQL, MySQL, and modern databases like Supabase and PlanetScale."
  },
  {
    "id": "devops-automator",
    "name": "DevOps Automator",
    "category": "software-development",
    "description": "Expert DevOps engineer specializing in infrastructure automation, CI/CD pipeline development, and cloud operations",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers/tree/main/software-development/devops-automator/SKILL.md",
    "path": "software-development/devops-automator/SKILL.md",
    "tags": [
      "software-development",
      "expert",
      "devops",
      "engineer",
      "specializing",
      "infrastructure",
      "automation"
    ],
    "whenToUse": "Expert DevOps engineer specializing in infrastructure automation, CI/CD pipeline development, and cloud operations"
  },
  {
    "id": "dispatching-parallel-agents",
    "name": "Dispatching Parallel Agents",
    "category": "software-development",
    "description": "Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies",
    "source": "superpowers",
    "url": "https://github.com/obra/superpowers/tree/main/skills/dispatching-parallel-agents/SKILL.md",
    "path": "skills/dispatching-parallel-agents/SKILL.md",
    "tags": [
      "software-development",
      "facing",
      "independent",
      "tasks",
      "can",
      "worked",
      "without"
    ],
    "whenToUse": "Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies"
  },
  {
    "id": "executing-plans",
    "name": "Executing Plans",
    "category": "software-development",
    "description": "Use when you have a written implementation plan to execute in a separate session with review checkpoints",
    "source": "superpowers + hermes",
    "url": "https://github.com/obra/superpowers/tree/main/skills/executing-plans/SKILL.md",
    "path": "software-development/executing-plans/SKILL.md",
    "tags": [
      "software-development",
      "written",
      "implementation",
      "plan",
      "execute",
      "separate",
      "session"
    ],
    "whenToUse": "Use when you have a written implementation plan to execute in a separate session with review checkpoints"
  },
  {
    "id": "finishing-a-development-branch",
    "name": "Finishing A Development Branch",
    "category": "software-development",
    "description": "Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup",
    "source": "superpowers",
    "url": "https://github.com/obra/superpowers/tree/main/skills/finishing-a-development-branch/SKILL.md",
    "path": "skills/finishing-a-development-branch/SKILL.md",
    "tags": [
      "software-development",
      "implementation",
      "complete",
      "tests",
      "pass",
      "decide",
      "how"
    ],
    "whenToUse": "Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development wor"
  },
  {
    "id": "incident-response-commander",
    "name": "Incident Response Commander",
    "category": "software-development",
    "description": "Expert incident commander specializing in production incident management, structured response coordination, post-mortem facilitation, SLO/SLI tracking, and on-call process design for reliable engineering organizations.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers/tree/main/software-development/incident-commander/SKILL.md",
    "path": "software-development/incident-commander/SKILL.md",
    "tags": [
      "software-development",
      "expert",
      "incident",
      "commander",
      "specializing",
      "production",
      "management"
    ],
    "whenToUse": "Expert incident commander specializing in production incident management, structured response coordination, post-mortem facilitation, SLO/SL"
  },
  {
    "id": "plan",
    "name": "Plan",
    "category": "software-development",
    "description": "Plan mode for Hermes — inspect context, write a markdown plan into the active workspace's `.hermes/plans/` directory, and do not execute the work.",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers/tree/main/software-development/plan/SKILL.md",
    "path": "software-development/plan/SKILL.md",
    "tags": [
      "software-development",
      "plan",
      "mode",
      "hermes",
      "inspect",
      "context",
      "write"
    ],
    "whenToUse": "Plan mode for Hermes — inspect context, write a markdown plan into the active workspace's `."
  },
  {
    "id": "receiving-code-review",
    "name": "Receiving Code Review",
    "category": "software-development",
    "description": "Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical rigor and verification, not performative agreement or blind implementation",
    "source": "superpowers",
    "url": "https://github.com/obra/superpowers/tree/main/skills/receiving-code-review/SKILL.md",
    "path": "skills/receiving-code-review/SKILL.md",
    "tags": [
      "software-development",
      "receiving",
      "code",
      "review",
      "feedback",
      "implementing",
      "suggestions"
    ],
    "whenToUse": "Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable -"
  },
  {
    "id": "requesting-code-review",
    "name": "Requesting Code Review",
    "category": "software-development",
    "description": "Use when completing tasks, implementing major features, or before merging to verify work meets requirements",
    "source": "superpowers",
    "url": "https://github.com/obra/superpowers/tree/main/skills/requesting-code-review/SKILL.md",
    "path": "skills/requesting-code-review/SKILL.md",
    "tags": [
      "software-development",
      "completing",
      "tasks",
      "implementing",
      "major",
      "features",
      "merging"
    ],
    "whenToUse": "Use when completing tasks, implementing major features, or before merging to verify work meets requirements"
  },
  {
    "id": "subagent-driven-development",
    "name": "Subagent Driven Development",
    "category": "software-development",
    "description": "Use when executing implementation plans with independent tasks. Dispatches fresh delegate_task per task with two-stage review (spec compliance then code quality).",
    "source": "superpowers + hermes",
    "url": "https://github.com/obra/superpowers/tree/main/skills/subagent-driven-development/SKILL.md",
    "path": "software-development/subagent-driven-development/SKILL.md",
    "tags": [
      "software-development",
      "executing",
      "implementation",
      "plans",
      "independent",
      "tasks",
      "dispatches"
    ],
    "whenToUse": "Use when executing implementation plans with independent tasks."
  },
  {
    "id": "systematic-debugging",
    "name": "Systematic Debugging",
    "category": "software-development",
    "description": "Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes",
    "source": "superpowers",
    "url": "https://github.com/obra/superpowers/tree/main/skills/systematic-debugging/SKILL.md",
    "path": "skills/systematic-debugging/SKILL.md",
    "tags": [
      "software-development",
      "encountering",
      "bug",
      "test",
      "failure",
      "unexpected",
      "behavior"
    ],
    "whenToUse": "Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes"
  },
  {
    "id": "test-driven-development",
    "name": "Test Driven Development",
    "category": "software-development",
    "description": "Use when implementing any feature or bugfix, before writing implementation code. Enforces RED-GREEN-REFACTOR cycle with test-first approach.",
    "source": "superpowers + hermes",
    "url": "https://github.com/obra/superpowers/tree/main/skills/test-driven-development/SKILL.md",
    "path": "software-development/test-driven-development/SKILL.md",
    "tags": [
      "software-development",
      "implementing",
      "feature",
      "bugfix",
      "writing",
      "implementation",
      "code"
    ],
    "whenToUse": "Use when implementing any feature or bugfix, before writing implementation code."
  },
  {
    "id": "using-git-worktrees",
    "name": "Using Git Worktrees",
    "category": "software-development",
    "description": "Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification",
    "source": "superpowers",
    "url": "https://github.com/obra/superpowers/tree/main/skills/using-git-worktrees/SKILL.md",
    "path": "skills/using-git-worktrees/SKILL.md",
    "tags": [
      "software-development",
      "starting",
      "feature",
      "work",
      "isolation",
      "current",
      "workspace"
    ],
    "whenToUse": "Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git w"
  },
  {
    "id": "using-superpowers",
    "name": "Using Superpowers",
    "category": "software-development",
    "description": "Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions",
    "source": "superpowers + hermes",
    "url": "https://github.com/obra/superpowers/tree/main/skills/using-superpowers/SKILL.md",
    "path": "software-development/using-superpowers/SKILL.md",
    "tags": [
      "software-development",
      "starting",
      "conversation",
      "establishes",
      "how",
      "find",
      "skills"
    ],
    "whenToUse": "Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including c"
  },
  {
    "id": "verification-before-completion",
    "name": "Verification Before Completion",
    "category": "software-development",
    "description": "Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always",
    "source": "superpowers",
    "url": "https://github.com/obra/superpowers/tree/main/skills/verification-before-completion/SKILL.md",
    "path": "skills/verification-before-completion/SKILL.md",
    "tags": [
      "software-development",
      "claim",
      "work",
      "complete",
      "fixed",
      "passing",
      "committing"
    ],
    "whenToUse": "Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and "
  },
  {
    "id": "writing-plans",
    "name": "Writing Plans",
    "category": "software-development",
    "description": "Use when you have a spec or requirements for a multi-step task, before touching code",
    "source": "superpowers",
    "url": "https://github.com/obra/superpowers/tree/main/skills/writing-plans/SKILL.md",
    "path": "skills/writing-plans/SKILL.md",
    "tags": [
      "software-development",
      "spec",
      "requirements",
      "multi-step",
      "task",
      "touching",
      "code"
    ],
    "whenToUse": "Use when you have a spec or requirements for a multi-step task, before touching code"
  },
  {
    "id": "writing-skills",
    "name": "Writing Skills",
    "category": "software-development",
    "description": "Use when creating new skills, editing existing skills, or verifying skills work before deployment",
    "source": "superpowers + hermes",
    "url": "https://github.com/obra/superpowers/tree/main/skills/writing-skills/SKILL.md",
    "path": "software-development/writing-skills/SKILL.md",
    "tags": [
      "software-development",
      "creating",
      "new",
      "skills",
      "editing",
      "existing",
      "verifying"
    ],
    "whenToUse": "Use when creating new skills, editing existing skills, or verifying skills work before deployment"
  },
  {
    "id": "reality-checker",
    "name": "Reality Checker",
    "category": "software-development/testing",
    "description": "Stops fantasy approvals, evidence-based certification - Default to \"NEEDS WORK\", requires overwhelming proof for production readiness",
    "source": "hermes",
    "url": "https://github.com/obra/superpowers",
    "path": "software-development/testing/reality-checker/SKILL.md",
    "tags": [
      "testing",
      "stops",
      "fantasy",
      "approvals",
      "evidence-based",
      "certification",
      "default"
    ],
    "whenToUse": "Stops fantasy approvals, evidence-based certification - Default to \"NEEDS WORK\", requires overwhelming proof for production readiness"
  }
];

import { loadGeneratedSkills } from "./skill-generator";

// Cache for generated skills (loaded once per server lifecycle)
let generatedSkillsCache: Skill[] | null = null;

export async function getAllSkillsAsync(): Promise<Skill[]> {
  if (!generatedSkillsCache) {
    generatedSkillsCache = await loadGeneratedSkills();
  }
  return [...SKILLS, ...generatedSkillsCache];
}

export function getAllSkills(): Skill[] {
  // Synchronous version returns only static skills
  // For generated skills, use getAllSkillsAsync()
  return SKILLS;
}

export function findSkillsByIds(ids: string[]): Skill[] {
  const set = new Set(ids);
  return SKILLS.filter((s) => set.has(s.id));
}

export function getCategories(): string[] {
  return Array.from(new Set(SKILLS.map((s) => s.category))).sort();
}
