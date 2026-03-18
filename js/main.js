/* ================================ 全局数据变量 =============================== */
let videos = [];
let articles = [];
let dailyPosts = [];

/* ================================ 工具函数 =============================== */
/** 获取 URL 查询参数 */
function getQuery(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

/* ================================ 渲染函数 =============================== */

/** 渲染视频列表（独立于分页） */
function renderVideos(list, limit) {
  if (!Array.isArray(list)) return;
  const container = document.getElementById("video-grid");
  if (!container) return;

  container.innerHTML = "";
  const items = limit ? list.slice(0, limit) : list;

  items.forEach((v) => {
    const div = document.createElement("div");
    div.className = "video-card";
    div.innerHTML = `
      <a href="video.html?id=${v.id}">
        <div class="video-thumb-wrapper">
          <img class="video-thumb" src="${v.cover}">
          <div class="play-btn">▶</div>
        </div>
      </a>
      <div class="video-info">
        <p class="video-title">${v.title}</p>
      </div>
    `;
    container.appendChild(div);
  });
}

/** 渲染文章列表（按日期降序，独立于分页） */
function renderArticles(list, limit) {
  if (!Array.isArray(list)) return;
  const container = document.getElementById("article-list");
  if (!container) return;

  // 按日期降序
  list.sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = "";
  const items = limit ? list.slice(0, limit) : list;

  items.forEach((a) => {
    const div = document.createElement("div");
    div.className = "article-card";
    const tagsHTML = a.tags
      ? a.tags.map((tag) => `<span class="tag">${tag}</span>`).join(" ")
      : "";
    div.innerHTML = `
      <h3 class="article-title"><a href="article.html?id=${a.id}">${a.title}</a></h3>
      <p class="date">${a.date}</p>
      <p class="excerpt">${a.excerpt || ""}</p>
      <div class="tags">${tagsHTML}</div>
    `;
    container.appendChild(div);
  });
}

/** 渲染日报列表（按日期降序，独立于分页） */
function renderDaily(list, limit) {
  if (!Array.isArray(list)) return;
  const container = document.getElementById("daily-list");
  if (!container) return;

  // 按日期降序
  list.sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = "";
  const items = limit ? list.slice(0, limit) : list;

  items.forEach((d) => {
    const div = document.createElement("div");
    div.className = "daily-card";
    div.innerHTML = `
      <h3><a href="daily_detail.html?id=${d.id}">${d.title}</a></h3>
      <p class="date">${d.date}</p>
      <p class="excerpt">${d.excerpt || ""}</p>
    `;
    container.appendChild(div);
  });
}

/* ================================ 分页逻辑 =============================== */
/**
 * renderPaginated 仅生成分页按钮，不处理 DOM 内容
 * @param {Array} list - 数据列表
 * @param {number} itemsPerPage - 每页数量
 * @param {function} renderPageContent - 渲染当前页内容的回调
 * @returns 更新列表函数
 */
function renderPaginated(list, itemsPerPage, renderPageContent) {
  let currentPage = 1;

  function renderPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const items = list.slice(start, end);

    renderPageContent(items);
    renderPaginationControls();
  }

  function renderPaginationControls() {
    const oldControls = document.getElementById("pagination-controls");
    if (oldControls) oldControls.remove();

    const totalPages = Math.ceil(list.length / itemsPerPage);
    const controls = document.createElement("div");
    controls.id = "pagination-controls";
    controls.className = "pagination-controls";

    const prev = document.createElement("button");
    prev.innerText = "Previous";
    prev.disabled = currentPage === 1;
    prev.onclick = () => {
      currentPage--;
      renderPage(currentPage);
    };
    controls.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      btn.disabled = i === currentPage;
      btn.onclick = () => {
        currentPage = i;
        renderPage(currentPage);
      };
      controls.appendChild(btn);
    }

    const next = document.createElement("button");
    next.innerText = "Next";
    next.disabled = currentPage === totalPages;
    next.onclick = () => {
      currentPage++;
      renderPage(currentPage);
    };
    controls.appendChild(next);

    document.body.appendChild(controls); // 或 append 到特定容器
  }

  renderPage(currentPage);

  return function updateList(newList) {
    list = newList;
    currentPage = 1;
    renderPage(currentPage);
  };
}

/* ================================ 视频播放页 =============================== */
function loadVideoPage() {
  if (!Array.isArray(videos)) return;
  const videoId = getQuery("id");
  if (!videoId) return;

  const video = videos.find((v) => v.id == videoId);
  if (!video) return;

  const player = document.getElementById("video-player");
  const title = document.getElementById("video-title");
  const desc = document.getElementById("video-desc");
  if (!player || !title || !desc) return;

  player.src = video.file;
  title.innerText = video.title;
  desc.innerText = video.desc;
}

/* ================================ 文章/日报详情页 =============================== */
function loadArticlePage() {
  if (!Array.isArray(articles)) return;
  const articleId = getQuery("id");
  if (!articleId) return;

  const article = articles.find((a) => a.id == articleId);
  if (!article) return;

  const container = document.getElementById("article-content");
  if (!container) return;

  fetch(article.md)
    .then((res) =>
      res.ok ? res.text() : Promise.reject("Markdown file not found"),
    )
    .then((md) => {
      container.innerHTML = marked.parse(md);
      wrapCodeBlocks(container);
      if (window.Prism) Prism.highlightAll();
    })
    .catch((err) => {
      container.innerHTML = "<p>Failed to load article.</p>";
      console.error(err);
    });
}

function loadDailyDetailPage() {
  if (!Array.isArray(dailyPosts)) return;
  const dailyId = getQuery("id");
  if (!dailyId) return;

  const container = document.getElementById("daily-detail-content");
  if (!container) return;

  const post = dailyPosts.find((d) => d.id == dailyId);
  if (!post) {
    container.innerHTML = "<p>Daily log not found.</p>";
    return;
  }

  fetch(post.md)
    .then((res) =>
      res.ok ? res.text() : Promise.reject("Markdown file not found"),
    )
    .then((md) => {
      container.innerHTML = marked.parse(md);
      wrapCodeBlocks(container);
      if (window.Prism) Prism.highlightAll();
    })
    .catch((err) => {
      container.innerHTML = "<p>Failed to load daily log.</p>";
      console.error(err);
    });
}

/* ================================ Markdown 代码块处理 =============================== */
function wrapCodeBlocks(container) {
  container.querySelectorAll("pre code").forEach((code) => {
    const wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper";

    const toolbar = document.createElement("div");
    toolbar.className = "code-toolbar";
    toolbar.innerHTML = `<button class="toggle-btn">▼</button><button class="copy-btn">Copy</button>`;
    wrapper.appendChild(toolbar);

    const pre = code.parentElement;
    pre.classList.add("code-block");
    pre.parentElement.replaceChild(wrapper, pre);
    wrapper.appendChild(pre);

    toolbar.querySelector(".toggle-btn").addEventListener("click", () => {
      wrapper.classList.toggle("code-collapsed");
      const collapsed = wrapper.classList.contains("code-collapsed");
      toolbar.querySelector(".toggle-btn").textContent = collapsed ? "►" : "▼";
      const codeBlock = wrapper.querySelector(".code-block");
      codeBlock.style.maxHeight = collapsed ? "0" : "400px";
      codeBlock.style.paddingTop = collapsed ? "0" : "12px";
      codeBlock.style.paddingBottom = collapsed ? "0" : "12px";
    });

    toolbar.querySelector(".copy-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(code.innerText).then(() => {
        const btn = toolbar.querySelector(".copy-btn");
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = "Copy"), 1000);
      });
    });
  });
}

/* ================================ 搜索功能 =============================== */
function setupSearch() {
  const videoSearch = document.getElementById("video-search");
  if (videoSearch) {
    const updateVideos = renderPaginated(videos, 6, renderVideos);
    videoSearch.onkeyup = () => {
      const q = videoSearch.value.toLowerCase();
      const filtered = videos.filter((v) => v.title.toLowerCase().includes(q));
      updateVideos(filtered);
    };
  }

  const articleSearch = document.getElementById("article-search");
  if (articleSearch) {
    const updateArticles = renderPaginated(articles, 6, renderArticles);
    articleSearch.onkeyup = () => {
      const q = articleSearch.value.toLowerCase();
      const filtered = articles.filter((a) =>
        a.title.toLowerCase().includes(q),
      );
      updateArticles(filtered);
    };
  }

  const dailySearch = document.getElementById("daily-search");
  if (dailySearch) {
    const updateDaily = renderPaginated(dailyPosts, 6, renderDaily);
    dailySearch.onkeyup = () => {
      const q = dailySearch.value.toLowerCase();
      const filtered = dailyPosts.filter((d) =>
        d.title.toLowerCase().includes(q),
      );
      updateDaily(filtered);
    };
  }
}

/* ================================ 文章标签功能 =============================== */
function setupArticleTags() {
  const container = document.getElementById("article-tags");
  if (!container || !Array.isArray(articles)) return;

  const allTags = [...new Set(articles.flatMap((a) => a.tags || []))];

  allTags.forEach((tag) => {
    const btn = document.createElement("button");
    btn.innerText = tag;

    btn.onclick = () => {
      const isActive = btn.classList.contains("active");
      document
        .querySelectorAll(".article-tags button")
        .forEach((b) => b.classList.remove("active"));
      if (!isActive) btn.classList.add("active");

      const filtered = isActive
        ? articles
        : articles.filter((a) => (a.tags || []).includes(tag));
      const updateArticles = renderPaginated(filtered, 6, renderArticles);
      updateArticles(filtered);
    };

    container.appendChild(btn);
  });
}

/* ================================ 页面初始化 =============================== */
document.addEventListener("DOMContentLoaded", () => {
  // 高亮导航
  const links = document.querySelectorAll(".nav-links a");
  const path = window.location.pathname;
  links.forEach((link) => {
    if (link.getAttribute("href") === path.split("/").pop())
      link.classList.add("active");
  });

  // 加载 JSON 数据
  Promise.all([
    fetch("./data/videos.json").then((res) =>
      res.ok ? res.json() : Promise.reject("Failed to load videos.json"),
    ),
    fetch("./data/articles.json").then((res) =>
      res.ok ? res.json() : Promise.reject("Failed to load articles.json"),
    ),
    fetch("./data/daily.json").then((res) =>
      res.ok ? res.json() : Promise.reject("Failed to load daily.json"),
    ),
  ])
    .then(([videoData, articleData, dailyData]) => {
      videos = videoData;
      articles = articleData;
      dailyPosts = dailyData;

      if (path.endsWith("index.html") || path === "/") {
        renderVideos(videos, 6);
        renderArticles(articles, 6);
      } else if (path.endsWith("videos.html")) {
        renderVideos(videos); // 脱离分页
      } else if (path.endsWith("articles.html")) {
        renderArticles(articles); // 脱离分页
        setupArticleTags();
      } else if (path.endsWith("daily.html")) {
        renderDaily(dailyPosts); // 脱离分页
      } else if (path.endsWith("daily_detail.html")) {
        loadDailyDetailPage();
      }

      loadVideoPage();
      loadArticlePage();
      wrapCodeBlocks(document);
      setupSearch();
    })
    .catch((err) => console.error("Failed to load JSON data:", err));
});
