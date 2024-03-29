[English](README.md) / [简体中文](README_CH.md)

# 基于AutoGen的9个机器人代理的综合项目: CodeGen

## 项目介绍
本项目Codegen在Microsoft AutoGen基础上实现了9个高效协作的代理（agent），以支持复杂的代码需求处理、代码自我执行与迭代等功能。该项目特色在于其独特的功能组合，特别是对于代码处理和迭代的高级支持。前端采用Flask框架，后端使用React，保证了用户界面的友好性和后端处理的高效性。未来专注于实现项目级别的app代码生成和解读。
![codegen](images/codegen.png)

## 主要特点
- **代码团队协作：** 通过9个代理的协作，有效处理复杂的代码需求。

- **EDA:** Explore Data Analyse 
![EDA](images/EDA.png)

- **代码自我执行与迭代：** 实现代码的自动执行和基于反馈的迭代改进。
![fix bug](images/code_bug_auto_fix.png)
- **文档阅读与理解：** 利用RAG（Retrieval-Augmented Generation）功能，可以有效地处理和理解大量文档。
![rag](images/rag.png)

- **网络爬取**
![website_scraping](images/scrape_website.png)

- **图像处理能力：** 具备读取和解释图像的能力，支持多种图像分析场景。


- **支持大语言模型LLM的URL** 大语言模型可以使用GPT4API（推荐）也可以使用免费的LLM URL（后文介绍）

- **代码的下载与调取**（进行中）

- **以项目为单位的批量代码生成**（进行中）

- **批量代码文件的解读**（进行中）

- **跨代码文件的debug检索**（进行中）

- **图像生成界面**（进行中）


![UI](UI.png)

## 技术栈
- **前端：** Flask
- **后端：** React

## 如何开始
请按照以下步骤设置和运行项目：

**克隆仓库：**
```bash
git clone https://github.com/Xin-Ray/CodeGen.git
```

## 安装依赖：
- **前端：**
```bash
cd path/to/frontend
npm install
```
    
- **后端：** 
```bash
cd path/to/backend/autogen_modifi
pip install .
```

## 启动服务器：
- **前端：**
```bash
npm start
```

- **后端：**
```bash
python flask_websockeGPT.py
```
## 如何使用LLM的URL
**方法一：**可以通过LM studio等工具，下载大语言模型到本地，开启服务器，并复制服务器连接，复制粘贴链接到我们的页面中，可以保留model_name为空白。

**方法二：**在colab中运行Mistral7B.ipynb来获取链接，复制粘贴链接到我们的页面中，可以保留model_name为空白。

**注意：**Mistral7B功能并不稳定，因为参数量少，推理能力弱，很难进行有效的团队协作。

**初衷：**我们制作LLM URL初衷在于GPT4太贵了，希望未来会有参数量少，可以在本地电脑执行，推理能力超过人类的开源免费大语言模型出现，可以直接应用该框架获得更好的拓展性能。

## 贡献指南

我们欢迎所有形式的贡献，无论是新功能的建议、代码提交还是问题报告。请遵循以下步骤：

1. Fork项目仓库。
2. 创建新的特性分支（`git checkout -b my-new-feature`）。
3. 提交你的更改（`git commit -am 'Add some feature'`）。
4. 推送到分支（`git push origin my-new-feature`）。
5. 创建新的Pull Request。

## 许可证
本项目遵循 MIT 许可证。

## 参考
autogen 官方网站： https://microsoft.github.io/autogen/docs/Contribute
autogen github：https://github.com/microsoft/autogen

## 联系方式
找工作中
如有任何问题或建议，请联系 [xxiang@mail.yu.edu]。

## 开发团队
Yeshiva University Codegen Team
