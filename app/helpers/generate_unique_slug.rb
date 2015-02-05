def generate_slug ( title, n, slug )

  duplicate = Song.first(:slug => slug)

  if duplicate
    n = n + 1
    slug_from_title = sluggify(title)
    new_slug = slug_from_title + "-" + n.to_s
    generate_slug( title, n, new_slug )
  else
    return slug
  end

end