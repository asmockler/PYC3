require 'rubygems'
require 'bundler'

Bundler.require

require './env'
require './main'
run Sinatra::Application