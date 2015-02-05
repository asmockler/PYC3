get '/' do
  @total_songs = Song.last.number
  @songs = Song.limit(10).find_each(:published => true, :order => :created_at.desc)
  #@facebook_image = "http://www.provoyachtclub.com/assets/provo_yacht_club.png"

  erb :'index/index'
end