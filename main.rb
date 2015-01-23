require 'active_support'
require 'active_support/core_ext'

Bundler.require

include Mongo

enable :sessions
set :session_secret, 'sd98u43nf834fnwe0s8f'

configure do
 db = URI.parse(ENV['MONGOHQ_URL'])
 db_name = db.path.gsub(/^\//,'')
 conn = Mongo::Connection.new(db.host, db.port).db(db_name)
 conn.authenticate(db.user, db.password) unless (db.user.nil? || db.password.nil?)
 set :mongo_db, conn
 MongoMapper.setup({'production' => {'uri' => ENV['MONGOHQ_URL']}}, 'production')
end

get '/' do
	erb :index
end