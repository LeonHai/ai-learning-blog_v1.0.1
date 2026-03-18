# AI Learning Hub项目发布-版本V1.0.0
## **1. 项目概述**

**AI Learning Hub** 是一个静态网站，用于记录个人 AI 学习历程。网站内容包括：

- **视频**：AI 学习视频
  
- **文章**：AI 学习笔记、教程、经验总结
  
- **日报**：每日工作记录与学习日志
  

**目标**：搭建个人知识库，动态展示学习内容，同时具备良好的可读性、互动性和响应式布局。

---

## **2. 逻辑架构图**

![逻辑架构图](images/逻辑架构图1.png)

---

## **3. 核心特性**

1. **动态内容渲染**
  
  - 视频、文章、日报数据来源于 JSON 文件
    
  - JS 负责将 JSON 数据渲染到页面 DOM 容器
    
  - 支持首页显示最新内容、列表页分页显示、详情页 Markdown 渲染
    
2. **Markdown 支持**
  
  - 文章和日报详情页使用 `marked.js` 解析 Markdown 文件
    
  - 支持 PrismJS 高亮代码块
    
  - 代码块增强功能：折叠/展开、复制按钮
    
3. **列表页功能**
  
  - 视频列表页、文章列表页、日报列表页均支持：
    
    - 搜索（按标题匹配）
      
    - 分页显示
      
    - 标签筛选（文章列表）
      
4. **统一卡片设计**
  
  - 视频卡片、文章卡片、日报卡片风格一致
    
  - 卡片 hover 动画：轻微浮起、阴影增强
    
  - 视频卡片封面图片固定大小，支持缩放效果
    
  - 文章/日报卡片标题和摘要限制行数，保持页面整洁
    
5. **响应式布局**
  
  - Sidebar + Content 主布局
    
  - 移动端自动改为单列显示
    
  - 卡片、搜索框、分页控件均自适应宽度
    
6. **全局布局**
  
  - Header：Logo + 主导航
    
  - Banner：页面标题
    
  - Sidebar：头像 + 个人简介
    
  - Footer：版权信息
    

---

## **4. 技术栈**

| 技术  | 用途  |
| --- | --- |
| HTML | 页面结构 |
| CSS (`style.css`) | 样式、布局、卡片、响应式、代码块、分页 |
| JS (`main.js`) | 数据加载、DOM 渲染、搜索、标签筛选、分页、Markdown 解析、代码块增强 |
| JSON | 数据存储（`videos.json`、`articles.json`、`daily.json`） |
| marked.js | Markdown 渲染 |
| PrismJS | 代码高亮 |
| ES6 | JavaScript 写法：模块化、箭头函数、Promise、fetch |

---

## **5. 页面与实现方式**

| 页面  | 功能  | 实现方式 |
| --- | --- | --- |
| `index.html` | 首页  | JS 渲染最新视频和文章，显示卡片；容器 `#video-grid` / `#article-list` |
| `about.html` | 关于  | 静态页面；内容写入 `#about-content` |
| `articles.html` | 文章列表 | JS 渲染文章列表、标签按钮；支持搜索和分页；容器 `#article-list` |
| `article.html` | 文章详情 | 动态加载 Markdown，渲染到 `#article-content`，代码块折叠/复制 |
| `videos.html` | 视频列表 | 渲染视频卡片，搜索和分页功能；容器 `#video-grid` |
| `video.html` | 视频播放页 | 根据 URL 参数 `id` 加载视频文件，显示标题和描述 |
| `daily.html` | 日报列表 | 渲染日报列表，搜索和分页；容器 `#daily-list` |
| `daily_detail.html` | 单条日报 | Markdown 渲染详情，代码块折叠/复制；容器 `#daily-detail-content` |

---

## **6. 数据结构**

JSON 文件统一格式：

{  
 "id": "1",  
 "title": "Example Title",  
 "cover": "images/example.jpg", // 视频或文章封面  
 "file": "videos/example.mp4", // 视频或 Markdown 文件  
 "desc": "Short description",  
 "tags": ["tag1", "tag2"], // 可选  
 "excerpt": "Short summary", // 列表页显示  
 "date": "YYYY-MM-DD" // 日报使用  
}

---

## **7. JS 核心实现点**

1. **数据渲染**
  
  - `renderVideos()`, `renderArticles()`：首页内容渲染
  - `renderPaginated()`：分页渲染列表页
    
2. **单页加载**
  
  - `loadVideoPage()`, `loadArticlePage()`, `loadDailyPage()`, `loadDailyDetailPage()`
3. **搜索**
  
  - 支持标题匹配，输入实时筛选列表
4. **标签筛选**
  
  - 文章列表页生成标签按钮，点击筛选文章
5. **代码块增强**
  
  - `wrapCodeBlocks()`：折叠/展开、复制按钮
6. **页面初始化**
  
  - `DOMContentLoaded` → 加载 JSON 数据 → 根据路径初始化页面功能

---

## **8. CSS 样式特点**

- 全局变量（颜色、字体、过渡动画）
  
- 卡片风格统一：阴影、圆角、hover 动画
  
- 列表页采用 Grid 布局（视频 3 列，移动端单列）
  
- Markdown 详情页内容宽度限制 800px，居中显示
  
- 响应式布局：sidebar + content 在小屏幕下自动换行
  
- 分页按钮、搜索框、标签按钮、代码块样式美观统一
  

---

## **9. 总结**

**AI Learning Hub** 的特点：

- 数据驱动，JSON + JS 实现动态渲染
  
- 统一的卡片设计和响应式布局
  
- 支持 Markdown 渲染和代码高亮增强
  
- 列表页功能完整：搜索、分页、标签筛选
  
- 页面布局简洁，用户体验良好
  
- 可扩展性强：新增功能（收藏、评论、多语言）易实现