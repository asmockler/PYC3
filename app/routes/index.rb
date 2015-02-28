get '/' do
  @total_songs = Song.last.number
  @songs = Song.limit(10).find_each(:published => true, :order => :created_at.desc)
  #@facebook_image = "http://www.provoyachtclub.com/assets/provo_yacht_club.png"

  erb :'index/index'
end

get '/more/:number_to_skip/:number_of_songs' do
	
	number_to_load = params[:number_of_songs] || 10
	number_to_skip = params[:number_to_skip]
	@songs = Song.limit(number_to_load).skip(number_to_skip).find_each(:published => true, :order => :created_at.desc)

	erb :'index/partials/songs'
end

get '/recent' do
	@songs = Song.limit(10).find_each(:published => true, :order => :created_at.desc)
	template = erb :'index/partials/songs'
	return [200, [{:template => template}.to_json]]
end

post '/login' do
	@user = User.first(:email => params[:email])

	if @user
		if @user.authenticate params[:password]
			session["user"] = @user
			@songs = Song.limit(10).skip(0).find_each(:published => true, :order => :created_at.desc)
			template = erb :'index/partials/songs'
			name = "#{@user['first_name']} #{@user['last_name']}"
			return [200, [{:template => template, :name => name}.to_json]]
		else
			return 401
		end
	else
		return 404
	end
end

post '/logout' do
	session.clear

	@songs = Song.limit(10).skip(0).find_each(:published => true, :order => :created_at.desc)
	template = erb :'index/partials/songs'

	return [200, [{:template => template}.to_json]]
end

get '/favorites/?:skip?' do
	return 401 unless session["user"]

	@skip = params[:skip] || 0

	@favorites = session["user"].favorites
	@songs = Song.limit(10).skip(@skip).find_each(:published => true, :order => :created_at.desc, :slug => @favorites)
	template = erb :'index/partials/songs'

	return [200, [{:template => template}.to_json]]
end

get '/hidden' do
	return 401 unless session["user"]

	@hidden_ok = true
	@hidden = []
	@songs = Song.limit(10).skip(@skip).find_each(:published => true, :order => :created_at.desc, :slug => session["user"].hidden)
	template = erb :'index/partials/songs'

	return [200, [{:template => template}.to_json]]
end

post '/api/:action/:slug' do
	return 401 unless session["user"]

	@slug = params[:slug]
	@user = User.find(session["user"]._id)

	if params[:action] == "favorite"
		@user.favorites << @slug
	elsif params[:action] == "unfavorite"
		@user.favorites.delete(@slug)
	elsif params[:action] == "hide"
		@user.hidden << @slug
	elsif params[:action] == "unhide"
		@user.hidden.delete(@slug)
	end

	@user.save
	@user.reload
	session["user"] = @user

	return 200
end