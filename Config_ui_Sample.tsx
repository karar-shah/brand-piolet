// sample imports
import { useDocumentStore } from "@/stores/useDocumentStore";
import { useConversationsStore, OPTIONS } from "@/stores/useConverstionsStore";
import { DocumentType } from "@/types/document-generation";
import { cn } from "@/lib/utils";

export function ConfigForm() {
  const { drafting, updateDraftingConfig } = useDocumentStore();
  const { selectedOption, brainstormConfig, updateBrainstormConfig } =
    useConversationsStore();

  const isBrainstormMode = selectedOption === OPTIONS.BRAINSTORM;

  const DRAFTING_CONFIGS = [
    {
      label: "Type",
      key: "docType",
      options: Object.values(DocumentType),
    },
    {
      label: "Tone",
      key: "tone",
      options: ["professional", "casual", "technical", "academic", "formal"],
    },
    {
      label: "Length",
      key: "length",
      options: ["short", "medium", "long"],
    },
    {
      label: "Format",
      key: "format",
      options: ["pdf", "docx", "md", "html"],
    },
  ];

  const renderPillGroup = (
    label: string,
    value: string,
    options: string[],
    onChange: (val: string) => void,
  ) => (
    <div className="flex flex-col gap-2" key={label}>
      <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              value === opt
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
            )}
          >
            {opt.replace(/_/g, " ")}
          </button>
        ))}
      </div>
    </div>
  );

  const renderMultiSelectPillGroup = (
    label: string,
    values: string[] = [],
    options: string[],
    onChange: (vals: string[]) => void,
  ) => (
    <div className="flex flex-col gap-2" key={label}>
      <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = values.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => {
                if (isSelected) {
                  onChange(values.filter((v) => v !== opt));
                } else {
                  onChange([...values, opt]);
                }
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                isSelected
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
              )}
            >
              {opt.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderTextInput = (
    label: string,
    value: string | undefined,
    placeholder: string,
    onChange: (val: string) => void,
    multiline: boolean = false,
  ) => (
    <div className="flex flex-col gap-2" key={label}>
      <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="max-h-[150px] min-h-[100px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none md:max-h-[250px]"
        />
      ) : (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
        />
      )}
    </div>
  );

  const renderSelect = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    options: { code: string; name: string }[],
  ) => (
    <div className="flex flex-col gap-2" key={label}>
      <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
        {label}
      </span>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
      >
        <option value="" disabled>
          Select {label}
        </option>
        {options.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );

  const config = drafting.config;

  if (isBrainstormMode) {
    return (
      <div className="flex max-h-[40vh] w-full flex-col gap-6 overflow-y-auto rounded-xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-gray-900">Brainstorm Details</h3>
          <p className="text-xs text-gray-500">
            Define your brainstorming parameters. All fields are optional.
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            {renderSelect(
              "Brainstorm Type",
              brainstormConfig.brainstormType || "",
              (val) => updateBrainstormConfig({ brainstormType: val as any }),
              [
                { code: "product_idea", name: "Product Idea" },
                { code: "business_strategy", name: "Business Strategy" },
                { code: "technical_solution", name: "Technical Solution" },
                { code: "problem_solving", name: "Problem Solving" },
                { code: "creative_content", name: "Creative Content" },
              ],
            )}

            {renderSelect(
              "Technique",
              brainstormConfig.technique || "",
              (val) => updateBrainstormConfig({ technique: val as any }),
              [
                { code: "scamper", name: "SCAMPER" },
                { code: "swot", name: "SWOT Analysis" },
                { code: "free_association", name: "Free Association" },
                { code: "mind_map", name: "Mind Mapping" },
                { code: "five_whys", name: "Five Whys" },
                { code: "six_thinking_hats", name: "Six Thinking Hats" },
                { code: "reverse_brainstorm", name: "Reverse Brainstorming" },
                { code: "starbursting", name: "Starbursting" },
              ],
            )}
          </div>

          {renderPillGroup(
            "Depth",
            brainstormConfig.depth || "",
            ["quick", "standard", "deep", "comprehensive"],
            (val) => updateBrainstormConfig({ depth: val as any }),
          )}

          {renderMultiSelectPillGroup(
            "Perspectives",
            brainstormConfig.perspective,
            [
              "creative",
              "user_centric",
              "business",
              "technical",
              "financial",
              "competitive",
              "operational",
            ],
            (vals) => updateBrainstormConfig({ perspective: vals as any }),
          )}

          {renderMultiSelectPillGroup(
            "Focus Areas",
            brainstormConfig.focusAreas,
            ["innovation", "profitability", "user_value", "uniqueness"],
            (vals) => updateBrainstormConfig({ focusAreas: vals as any }),
          )}

          {renderTextInput(
            "Additional Instructions",
            brainstormConfig.additionalInstructions,
            "Any specific goals or context...",
            (val) => updateBrainstormConfig({ additionalInstructions: val }),
          )}

          <div className="grid grid-cols-2 gap-4">
            {renderTextInput(
              "Budget Constraint",
              brainstormConfig.constraints?.budget,
              "e.g. $5000",
              (val) =>
                updateBrainstormConfig({
                  constraints: { ...brainstormConfig.constraints, budget: val },
                }),
            )}
            {renderTextInput(
              "Timeline Constraint",
              brainstormConfig.constraints?.timeline,
              "e.g. 2 weeks",
              (val) =>
                updateBrainstormConfig({
                  constraints: {
                    ...brainstormConfig.constraints,
                    timeline: val,
                  },
                }),
            )}
          </div>
          {renderTextInput(
            "Technology Constraint",
            Array.isArray(brainstormConfig.constraints?.technology)
              ? brainstormConfig.constraints.technology.join(", ")
              : brainstormConfig.constraints?.technology || "",
            "e.g. React, Node.js (comma separated)",
            (val) =>
              updateBrainstormConfig({
                constraints: {
                  ...brainstormConfig.constraints,
                  technology: val,
                },
              }),
          )}
          {renderTextInput(
            "Target Audience Constraint",
            brainstormConfig.constraints?.targetAudience,
            "e.g. Millennials",
            (val) =>
              updateBrainstormConfig({
                constraints: {
                  ...brainstormConfig.constraints,
                  targetAudience: val,
                },
              }),
          )}
        </div>
      </div>
    );
  }

  // Default Drafting View (kept exactly as original for easy future expansion)
  return (
    <div className="flex max-h-[55vh] w-full flex-col gap-6 overflow-y-auto rounded-xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-gray-900">Configuration</h3>
        <p className="text-xs text-gray-500">
          Select your preferences below and describe the content in the chat
          input.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {DRAFTING_CONFIGS.map((conf) =>
          renderPillGroup(
            conf.label,
            (config as any)[conf.key],
            conf.options,
            (val) => updateDraftingConfig({ [conf.key]: val } as any),
          ),
        )}
      </div>
    </div>
  );
}
