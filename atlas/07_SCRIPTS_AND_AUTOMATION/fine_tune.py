import glob
from transformers import AutoTokenizer, AutoModelForCausalLM, Trainer, TrainingArguments

# 1. Load the tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("Salesforce/codegen-2B-mono")
model = AutoModelForCausalLM.from_pretrained("Salesforce/codegen-2B-mono")

# 2. Prepare the dataset
python_files = glob.glob("/Users/adamstack/chip/chip/10-AREAS/AI Development/atlas/**/*.py", recursive=True)

with open("all_code.py", "w") as outfile:
    for filename in python_files:
        with open(filename, "r") as infile:
            outfile.write(infile.read())

# 3. Fine-tune the model
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=1,
    per_device_train_batch_size=1,
    per_device_eval_batch_size=1,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir="./logs",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset="all_code.py",
)

trainer.train()

# 4. Save the fine-tuned model
model.save_pretrained("./fine-tuned-model")
