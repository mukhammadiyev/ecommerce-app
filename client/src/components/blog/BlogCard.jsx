export default function BlogCard({
  imageSrc = "",
  authorAvatar = "",
  authorName = "Oliver Bennett",
  date = "18 Jan 2022",
  title = "Lorem Ipsum Is a Dummy Text Used As The Heading Of a Blog",
  href = "#",
}) {
  return (
    <a href={href} className="block w-full cursor-pointer group">
      {/* Image */}
      <div className="w-full h-52 sm:h-60 lg:h-70 rounded-2xl overflow-hidden bg-[#9e9e9e]">
        {imageSrc && (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 mt-3 sm:mt-4">
        <div className="w-8 h-8 rounded-full bg-[#9e9e9e] overflow-hidden shrink-0">
          {authorAvatar && (
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <span className="text-sm text-gray-700">{authorName}</span>
        <span className="text-gray-400 text-sm">•</span>
        <span className="text-sm text-gray-500">{date}</span>
      </div>

      {/* Title */}
      <h2 className="mt-2 sm:mt-3 text-[15px] sm:text-[17px] font-semibold text-gray-900 leading-snug group-hover:underline">
        {title}
      </h2>
    </a>
  );
}
