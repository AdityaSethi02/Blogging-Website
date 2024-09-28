import { AppBar } from "../components/AppBar";
import { BlogCard } from "../components/BlogCard";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks";
import { formatDate } from "./MyBlogs";

export const AllBlogs = () => {
    const { loading, blogs } = useBlogs();

    if (loading) {
        return (
            <div>
                <AppBar />

                <div className="flex justify-center">
                    <div>
                        <BlogSkeleton />
                        <BlogSkeleton />
                        <BlogSkeleton />
                        <BlogSkeleton />
                        <BlogSkeleton />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <AppBar />

            <div className="flex justify-center">
                <div>
                    {blogs.map(blog => <BlogCard key={blog.id} id={blog.id} authorName={blog.author.name || "Anonymous"} title={blog.title} content={blog.content} publishedDate={formatDate(new Date())} />)}
                </div>
            </div>
        </div>
    )
}