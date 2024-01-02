import pytest
import os
import sys
import autogen
from autogen import OpenAIWrapper

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from test_assistant_agent import KEY_LOC, OAI_CONFIG_LIST  # noqa: E402

try:
    import openai
    from autogen.agentchat.contrib.gpt_assistant_agent import GPTAssistantAgent
    from autogen.oai.openai_utils import retrieve_assistants_by_name

    skip_test = False
except ImportError:
    skip_test = True

config_list = autogen.config_list_from_json(
    OAI_CONFIG_LIST, file_location=KEY_LOC, filter_dict={"api_type": ["openai"]}
)


def ask_ossinsight(question):
    return f"That is a good question, but I don't know the answer yet. Please ask your human  developer friend to help you. \n\n{question}"


@pytest.mark.skipif(
    sys.platform in ["darwin", "win32"] or skip_test,
    reason="do not run on MacOS or windows or dependency is not installed",
)
def test_gpt_assistant_chat():
    ossinsight_api_schema = {
        "name": "ossinsight_data_api",
        "parameters": {
            "type": "object",
            "properties": {
                "question": {
                    "type": "string",
                    "description": "Enter your GitHub data question in the form of a clear and specific question to ensure the returned data is accurate and valuable. For optimal results, specify the desired format for the data table in your request.",
                }
            },
            "required": ["question"],
        },
        "description": "This is an API endpoint allowing users (analysts) to input question about GitHub in text format to retrieve the realted and structured data.",
    }

    name = "For test_gpt_assistant_chat"
    analyst = GPTAssistantAgent(
        name=name,
        llm_config={"tools": [{"type": "function", "function": ossinsight_api_schema}], "config_list": config_list},
        instructions="Hello, Open Source Project Analyst. You'll conduct comprehensive evaluations of open source projects or organizations on the GitHub platform",
    )
    analyst.register_function(
        function_map={
            "ossinsight_data_api": ask_ossinsight,
        }
    )

    ok, response = analyst._invoke_assistant(
        [{"role": "user", "content": "What is the most popular open source project on GitHub?"}]
    )
    executable = analyst.can_execute_function("ossinsight_data_api")
    analyst.reset()
    threads_count = len(analyst._openai_threads)
    analyst.delete_assistant()

    assert ok is True
    assert response.get("role", "") == "assistant"
    assert len(response.get("content", "")) > 0
    assert executable is False
    assert threads_count == 0


@pytest.mark.skipif(
    sys.platform in ["darwin", "win32"] or skip_test,
    reason="do not run on MacOS or windows or dependency is not installed",
)
def test_get_assistant_instructions():
    """
    Test function to create a new GPTAssistantAgent, set its instructions, retrieve the instructions,
    and assert that the retrieved instructions match the set instructions.
    """
    name = "For test_get_assistant_instructions"
    assistant = GPTAssistantAgent(
        name,
        instructions="This is a test",
        llm_config={
            "config_list": config_list,
        },
    )

    instruction_match = assistant.get_assistant_instructions() == "This is a test"
    assistant.delete_assistant()

    assert instruction_match is True


@pytest.mark.skipif(
    sys.platform in ["darwin", "win32"] or skip_test,
    reason="do not run on MacOS or windows or dependency is not installed",
)
def test_gpt_assistant_instructions_overwrite():
    """
    Test that the instructions of a GPTAssistantAgent can be overwritten or not depending on the value of the
    `overwrite_instructions` parameter when creating a new assistant with the same ID.

    Steps:
    1. Create a new GPTAssistantAgent with some instructions.
    2. Get the ID of the assistant.
    3. Create a new GPTAssistantAgent with the same ID but different instructions and `overwrite_instructions=True`.
    4. Check that the instructions of the assistant have been overwritten with the new ones.
    """

    name = "For test_gpt_assistant_instructions_overwrite"
    instructions1 = "This is a test #1"
    instructions2 = "This is a test #2"

    assistant = GPTAssistantAgent(
        name,
        instructions=instructions1,
        llm_config={
            "config_list": config_list,
        },
    )

    assistant_id = assistant.assistant_id
    assistant = GPTAssistantAgent(
        name,
        instructions=instructions2,
        llm_config={
            "config_list": config_list,
            "assistant_id": assistant_id,
        },
        overwrite_instructions=True,
    )

    instruction_match = assistant.get_assistant_instructions() == instructions2
    assistant.delete_assistant()

    assert instruction_match is True


@pytest.mark.skipif(
    sys.platform in ["darwin", "win32"] or skip_test,
    reason="do not run on MacOS or windows or dependency is not installed",
)
def test_gpt_assistant_existing_no_instructions():
    """
    Test function to check if the GPTAssistantAgent can retrieve instructions for an existing assistant
    even if the assistant was created with no instructions initially.
    """
    name = "For test_gpt_assistant_existing_no_instructions"
    instructions = "This is a test #1"

    assistant = GPTAssistantAgent(
        name,
        instructions=instructions,
        llm_config={
            "config_list": config_list,
        },
    )

    assistant_id = assistant.assistant_id

    # create a new assistant with the same ID but no instructions
    assistant = GPTAssistantAgent(
        name,
        llm_config={
            "config_list": config_list,
            "assistant_id": assistant_id,
        },
    )

    instruction_match = assistant.get_assistant_instructions() == instructions
    assistant.delete_assistant()
    assert instruction_match is True


@pytest.mark.skipif(
    sys.platform in ["darwin", "win32"] or skip_test,
    reason="do not run on MacOS or windows or dependency is not installed",
)
def test_get_assistant_files():
    """
    Test function to create a new GPTAssistantAgent, set its instructions, retrieve the instructions,
    and assert that the retrieved instructions match the set instructions.
    """
    current_file_path = os.path.abspath(__file__)
    openai_client = OpenAIWrapper(config_list=config_list)._clients[0]
    file = openai_client.files.create(file=open(current_file_path, "rb"), purpose="assistants")
    name = "For test_get_assistant_files"

    assistant = GPTAssistantAgent(
        name,
        instructions="This is a test",
        llm_config={
            "config_list": config_list,
            "tools": [{"type": "retrieval"}],
            "file_ids": [file.id],
        },
    )

    files = assistant.openai_client.beta.assistants.files.list(assistant_id=assistant.assistant_id)
    retrived_file_ids = [fild.id for fild in files]
    expected_file_id = file.id

    assistant.delete_assistant()
    openai_client.files.delete(file.id)

    assert expected_file_id in retrived_file_ids


@pytest.mark.skipif(
    sys.platform in ["darwin", "win32"] or skip_test,
    reason="do not run on MacOS or windows or dependency is not installed",
)
def test_assistant_retrieval():
    """
    Test function to check if the GPTAssistantAgent can retrieve the same assistant
    """

    name = "For test_assistant_retrieval"

    assistant_first = GPTAssistantAgent(
        name,
        instructions="This is a test",
        llm_config={"config_list": config_list},
    )
    candidate_first = retrieve_assistants_by_name(assistant_first.openai_client, name)

    assistant_second = GPTAssistantAgent(
        name,
        instructions="This is a test",
        llm_config={"config_list": config_list},
    )
    candidate_second = retrieve_assistants_by_name(assistant_second.openai_client, name)

    try:
        assistant_first.delete_assistant()
        assistant_second.delete_assistant()
    except openai.NotFoundError:
        # Not found error is expected because the same assistant can not be deleted twice
        pass

    assert candidate_first == candidate_second


if __name__ == "__main__":
    test_gpt_assistant_chat()
    test_get_assistant_instructions()
    test_gpt_assistant_instructions_overwrite()
    test_gpt_assistant_existing_no_instructions()
    test_get_assistant_files()
