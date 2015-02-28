class User
	include MongoMapper::Document
	include ActiveModel::SecurePassword

	has_secure_password
	key :first_name,          String
	key :last_name,           String
	key :email,               String, :unique => true
	key :admin,               Boolean
	key :password_digest,     String
	key :favorites, 		  Array     
	key :hidden,			  Array   
end