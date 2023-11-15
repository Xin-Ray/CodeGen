import pytest
import os
import sys
import autogen

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from test_assistant_agent import KEY_LOC, OAI_CONFIG_LIST  # noqa: E402

try:
    import openai
    from autogen.agentchat.contrib.retrieve_assistant_agent import (
        RetrieveAssistantAgent,
    )
    from autogen.agentchat.contrib.retrieve_user_proxy_agent import (
        RetrieveUserProxyAgent,
    )
    import chromadb
    from chromadb.utils import embedding_functions as ef

    skip_test = False
except ImportError:
    skip_test = True


@pytest.mark.skipif(
    sys.platform in ["darwin", "win32"] or skip_test,
    reason="do not run on MacOS or windows or dependency is not installed",
)
def test_retrievechat():
    conversations = {}
    # autogen.ChatCompletion.start_logging(conversations)  # deprecated in v0.2

    config_list = autogen.config_list_from_json(
        OAI_CONFIG_LIST,
        file_location=KEY_LOC,
    )

    assistant = RetrieveAssistantAgent(
        name="assistant",
        system_message="You are a helpful assistant.",
        llm_config={
            "timeout": 600,
            "seed": 42,
            "config_list": config_list,
        },
    )

    sentence_transformer_ef = ef.SentenceTransformerEmbeddingFunction()
    ragproxyagent = RetrieveUserProxyAgent(
        name="ragproxyagent",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=2,
        retrieve_config={
            "docs_path": "./website/docs",
            "chunk_token_size": 2000,
            "model": config_list[0]["model"],
            "client": chromadb.PersistentClient(path="/tmp/chromadb"),
            "embedding_function": sentence_transformer_ef,
            "get_or_create": True,
        },
    )

    assistant.reset()

    code_problem = "How can I use FLAML to perform a classification task, set use_spark=True, train 30 seconds and force cancel jobs if time limit is reached."
    ragproxyagent.initiate_chat(assistant, problem=code_problem, search_string="spark", silent=True)

    print(conversations)


if __name__ == "__main__":
    test_retrievechat()
