get '/' do
  @total_songs = Song.last.number
  @songs = Song.limit(10).find_each(:published => true, :order => :created_at.desc)
  #@facebook_image = "http://www.provoyachtclub.com/assets/provo_yacht_club.png"

  erb :'index/index'
end

get '/more/:number_to_skip' do
	number_to_skip = params[:number_to_skip]
	@songs = Song.limit(10).skip(number_to_skip).find_each(:published => true, :order => :created_at.desc)

	erb :'index/partials/songs'
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

post '/favorite/:action/:slug' do
	return 401 unless session["user"]

	@slug = params[:slug]
	@user = User.find(session["user"]._id)

	if params[:action] == "favorite"
		@user.favorites << @slug
	elsif params[:action] == "unfavorite"
		@user.favorites.delete(@slug)
	end
	@user.save

	@user.reload
	session["user"] = @user

	return 200
end

