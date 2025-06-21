'use client';

export default function BlogSidebar() {
  return (
    <div className='col-lg-4'>
      <div className='sidebar'>
        {/* Categories */}
        <div className='widget widget-categories'>
          <h5 className='widget-title'>Categories</h5>
          <ul className='list-unstyled'>
            <li>
              <a href='#'>AITA Stories</a>
            </li>
            <li>
              <a href='#'>Relationship Drama</a>
            </li>
            <li>
              <a href='#'>Revenge Tales</a>
            </li>
            <li>
              <a href='#'>Work Stories</a>
            </li>
            <li>
              <a href='#'>Funny Fails</a>
            </li>
          </ul>
        </div>

        {/* Recent Posts */}
        <div className='widget widget-recent'>
          <h5 className='widget-title'>Recent Posts</h5>
          <div className='recent-posts'>
            <div className='recent-post'>
              <h6>
                <a href='#'>Loading recent content...</a>
              </h6>
              <span className='post-date'>Just now</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className='widget widget-tags'>
          <h5 className='widget-title'>Popular Tags</h5>
          <div className='tags'>
            <a href='#' className='tag'>
              viral
            </a>
            <a href='#' className='tag'>
              reddit
            </a>
            <a href='#' className='tag'>
              drama
            </a>
            <a href='#' className='tag'>
              relationships
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
