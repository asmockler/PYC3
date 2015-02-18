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
			puts "Nailed it"
		else
			puts "Wrong password"
		end
	else
		"no_user"
	end
end