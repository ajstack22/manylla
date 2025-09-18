import os

STORY_DIR = "/Users/adamstack/chip/chip/10-AREAS/AI Development/atlas/09_STORIES"
TEMPLATE_PATH = os.path.join(STORY_DIR, "templates", "intent_template.md")

def create_story():
    """
    This function creates a new story from the intent template.
    """
    story_name = input("Enter the name of the story: ")
    story_file_path = os.path.join(STORY_DIR, f"{story_name}.md")

    user_persona = input("Enter the user persona: ")
    what = input("Enter the 'What': ")
    why = input("Enter the 'Why': ")
    success_metrics = input("Enter the success metrics: ")
    acceptance_criteria = input("Enter the acceptance criteria in Gherkin format (e.g., Scenario: ...\nGiven...\nWhen...\nThen...): ")
    evidence_and_data_requirements = input("Enter the evidence and data requirements: ")
    product_manager = input("Enter the name of the Product Manager: ")
    lead_developer = input("Enter the name of the Lead Developer: ")
    qa_engineer = input("Enter the name of the QA Engineer: ")

    with open(TEMPLATE_PATH, 'r') as f:
        template_content = f.read()

    story_content = template_content.replace("[User Role]", user_persona)
    story_content = story_content.replace("[Action]", what)
    story_content = story_content.replace("[Benefit]", why)
    story_content = story_content.replace("[How will we know if this is successful? What metrics will we use to measure success?]", success_metrics)
    story_content = story_content.replace("[Define the acceptance criteria in a structured format, like Gherkin (Given/When/Then).]", acceptance_criteria)
    story_content = story_content.replace("[What evidence will be required to prove that the story is complete?]", evidence_and_data_requirements)
    story_content = story_content.replace("[Name]", product_manager, 1)
    story_content = story_content.replace("[Name]", lead_developer, 1)
    story_content = story_content.replace("[Name]", qa_engineer, 1)

    with open(story_file_path, 'w') as f:
        f.write(story_content)

    print(f"Successfully created new story: {story_file_path}")

if __name__ == "__main__":
    create_story()
