class Song 
    include MongoMapper::Document

    key :soundcloud_url, String
    key :title, String
    key :artist, String
    key :album, String
    key :album_art, String
    key :tag_1, String
    key :tag_2, String
    key :is_local, Boolean
    key :author, String
    key :has_blog_post, Boolean
    key :blog_title, String
    key :blog_post, String
    key :published, Boolean
    key :slug, String
    key :number, Integer

    timestamps!
end