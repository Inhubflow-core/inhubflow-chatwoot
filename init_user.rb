user = User.find_by(email: 'inhubflow.com@gmail.com') || User.new(email: 'inhubflow.com@gmail.com')
user.name = 'InHubFlow'
user.password = 'admin123456'
user.password_confirmation = 'admin123456'
user.confirmed_at = Time.current
user.type = 'SuperAdmin'
user.save!(validate: false)

account = Account.first || Account.create!(name: 'InHubFlow INC')
AccountUser.find_or_create_by!(account: account, user: user, role: :administrator)
::Redis::Alfred.delete(::Redis::Alfred::CHATWOOT_INSTALLATION_ONBOARDING)

puts "==> SuperAdmin Initialized Successfully for inhubflow.com@gmail.com"
