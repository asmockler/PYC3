class User
	include MongoMapper::Document
	include ActiveModel::SecurePassword

	has_secure_password
	key :first_name,          String
	key :last_name,           String
	key :email,               String, :unique => true
	key :admin,               Boolean
	key :password_digest,     String
	many :favorites          
end

# Favorites are set by setting Favorite._id to the BSON::ObjectId of the song favorited
# Favorite.new(:_id => BSON::.....)
class Favorite
	include MongoMapper::EmbeddedDocument
end