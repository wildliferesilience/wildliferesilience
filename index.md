---
layout: default
---

<div id="blog-posts">
  {% for post in paginator.posts %}
  <div class="blog-post">
    <h2 class="blog-post-title">{{ post.title }}</h2>
    <p class="blog-post-meta">{{ post.date | date_to_string }}</p>
    {{ post.content }}
  </div>
  {% endfor %}
</div>

<!-- pagination links -->
{% if paginator.total_pages > 1 %}
<div class="pagination">
  {% if paginator.previous_page %}
  <a href="{{ paginator.previous_page_path }}">&laquo; Prev</a>
  {% else %}
  <span>&laquo; Prev</span>
  {% endif %}

  {% for page in (1..paginator.total_pages) %}
    {% if page == paginator.page %}
    <span>{{ page }}</span>
    {% else %}
    <a href="{{ site.baseurl }}/page{{ page }}/">{{ page }}</a>
    {% endif %}
  {% endfor %}

  {% if paginator.next_page %}
  <a href="{{ paginator.next_page_path }}">Next &raquo;</a>
  {% else %}
  <span>Next &raquo;</span>
  {% endif %}
</div>
{% endif %}
