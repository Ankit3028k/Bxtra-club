const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Admin = require('../models/Admin');
const Plan = require('../models/Plan');
const Perk = require('../models/Perk');
const Post = require('../models/Post');
const Event = require('../models/Event');
const Request = require('../models/Request');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bxtra-club', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Plan.deleteMany({});
    await Perk.deleteMany({});
    await Post.deleteMany({});
    await Event.deleteMany({});
    await Request.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create Admin
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
    const admin = await Admin.create({
      name: 'BXtra Admin',
      email: process.env.ADMIN_EMAIL || 'admin@bxtraclub.com',
      password: adminPassword,
      role: 'super_admin',
      permissions: ['manage_users', 'manage_events', 'manage_posts', 'manage_requests', 'manage_perks', 'view_analytics']
    });

    console.log('👤 Created admin user');

    // Create Plans
    const plans = await Plan.create([
      {
        name: 'Basic',
        price: 29,
        description: 'Perfect for early-stage founders',
        features: [
          { name: 'Access to founder network', included: true },
          { name: 'Monthly networking events', included: true },
          { name: 'Basic perks & discounts', included: true },
          { name: 'Community forum access', included: true },
          { name: 'Mobile app', included: true }
        ],
        stripeProductId: 'prod_basic',
        stripePriceId: 'price_basic',
        order: 1
      },
      {
        name: 'Premium',
        price: 99,
        description: 'Best for growing startups',
        features: [
          { name: 'Everything in Basic', included: true },
          { name: 'Exclusive investor events', included: true },
          { name: 'Premium perks worth $10k+', included: true },
          { name: 'Direct messaging', included: true },
          { name: 'Priority customer support', included: true },
          { name: 'Startup showcases', included: true },
          { name: 'Mentorship program', included: true }
        ],
        stripeProductId: 'prod_premium',
        stripePriceId: 'price_premium',
        isPopular: true,
        order: 2
      },
      {
        name: 'Enterprise',
        price: 299,
        description: 'For established companies',
        features: [
          { name: 'Everything in Premium', included: true },
          { name: 'Custom networking events', included: true },
          { name: 'Dedicated account manager', included: true },
          { name: 'API access', included: true },
          { name: 'Advanced analytics', included: true },
          { name: 'White-label solutions', included: true },
          { name: 'Custom integrations', included: true }
        ],
        stripeProductId: 'prod_enterprise',
        stripePriceId: 'price_enterprise',
        order: 3
      }
    ]);

    console.log('💳 Created subscription plans');

    // Create Perks
    const perks = await Perk.create([
      {
        name: 'AWS Activate Credits',
        description: '$5,000 in AWS credits for cloud infrastructure and services',
        company: 'Amazon Web Services',
        logo: 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'cloud',
        value: { amount: 5000, currency: 'USD', description: '$5,000 in credits' },
        eligiblePlans: ['Basic', 'Premium', 'Enterprise'],
        link: 'https://aws.amazon.com/activate/',
        code: 'BXTRA2024',
        instructions: 'Apply through AWS Activate portal with the provided code',
        tags: ['aws', 'cloud', 'infrastructure']
      },
      {
        name: 'Stripe Atlas',
        description: 'Free company incorporation and banking setup',
        company: 'Stripe',
        logo: 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'legal',
        value: { amount: 500, currency: 'USD', description: 'Free incorporation (normally $500)' },
        eligiblePlans: ['Premium', 'Enterprise'],
        link: 'https://stripe.com/atlas',
        instructions: 'Sign up through the provided link to get free incorporation',
        tags: ['incorporation', 'legal', 'banking']
      },
      {
        name: 'HubSpot for Startups',
        description: '90% off HubSpot CRM and marketing tools for first year',
        company: 'HubSpot',
        logo: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'marketing',
        value: { amount: 10000, currency: 'USD', description: '90% off first year' },
        eligiblePlans: ['Basic', 'Premium', 'Enterprise'],
        link: 'https://hubspot.com/startups',
        code: 'BXTRACLUB90',
        instructions: 'Apply through HubSpot for Startups program',
        tags: ['crm', 'marketing', 'sales']
      },
      {
        name: 'GitHub Enterprise',
        description: 'Free GitHub Enterprise for teams up to 50 developers',
        company: 'GitHub',
        logo: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'development',
        value: { amount: 2400, currency: 'USD', description: 'Free for 1 year (normally $200/month)' },
        eligiblePlans: ['Premium', 'Enterprise'],
        link: 'https://github.com/enterprise',
        instructions: 'Contact GitHub sales with your BXtra Club membership proof',
        tags: ['github', 'development', 'version-control']
      },
      {
        name: 'Notion for Startups',
        description: '$1,000 in Notion credits plus 6 months free',
        company: 'Notion',
        logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'tools',
        value: { amount: 1000, currency: 'USD', description: '$1,000 credits + 6 months free' },
        eligiblePlans: ['Basic', 'Premium', 'Enterprise'],
        link: 'https://notion.so/startups',
        code: 'BXTRA1000',
        instructions: 'Apply through Notion for Startups program',
        tags: ['productivity', 'collaboration', 'workspace']
      }
    ]);

    console.log('🎁 Created perks');

    // Create Sample Users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@startup.com',
        password: 'password123',
        startup: 'TechFlow',
        role: 'CEO',
        city: 'San Francisco',
        status: 'approved',
        plan: 'Premium',
        bio: 'Serial entrepreneur passionate about AI and machine learning.',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      {
        name: 'Sarah Chen',
        email: 'sarah@innovate.com',
        startup: 'InnovateAI',
        role: 'CTO',
        city: 'New York',
        status: 'approved',
        plan: 'Basic',
        bio: 'Building the future of artificial intelligence.',
        avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      {
        name: 'Alex Rodriguez',
        email: 'alex@dataviz.com',
        startup: 'DataViz',
        role: 'Founder',
        city: 'Austin',
        status: 'approved',
        plan: 'Enterprise',
        bio: 'Data visualization expert helping companies make sense of their data.',
        avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      {
        name: 'Maria Garcia',
        email: 'maria@greentech.com',
        startup: 'GreenTech Solutions',
        role: 'CEO',
        city: 'Seattle',
        status: 'pending',
        plan: 'Premium',
        bio: 'Sustainable technology advocate working on renewable energy solutions.',
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      {
        name: 'David Kim',
        email: 'david@financeai.com',
        startup: 'FinanceAI',
        role: 'CTO',
        city: 'Boston',
        status: 'pending',
        plan: 'Basic',
        bio: 'Fintech innovator building AI-powered financial tools.',
        avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150'
      }
    ]);

    console.log('👥 Created sample users');

    // Create connections between users
    users[0].connections.push(users[1]._id, users[2]._id);
    users[1].connections.push(users[0]._id);
    users[2].connections.push(users[0]._id);
    
    await Promise.all(users.map(user => user.save()));

    console.log('🤝 Created user connections');

    // Create Sample Posts
    const posts = await Post.create([
      {
        author: users[0]._id,
        content: 'Just closed our Series A! 🎉 Grateful for the amazing journey and excited for what\'s ahead. The BXtra Club community has been instrumental in connecting us with the right investors.',
        tags: ['funding', 'seriesA', 'milestone'],
        likes: [{ user: users[1]._id }, { user: users[2]._id }]
      },
      {
        author: users[1]._id,
        content: 'Looking for feedback on our new AI-powered analytics dashboard. Would love to connect with fellow founders who have experience in the B2B SaaS space.',
        image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
        tags: ['AI', 'SaaS', 'feedback'],
        likes: [{ user: users[0]._id }],
        comments: [
          {
            user: users[2]._id,
            content: 'This looks amazing! Would love to learn more about your approach.'
          }
        ]
      },
      {
        author: users[2]._id,
        content: 'Excited to announce that DataViz has been selected for the TechStars accelerator program! Looking forward to the next chapter of our journey.',
        tags: ['accelerator', 'techstars', 'announcement'],
        likes: [{ user: users[0]._id }, { user: users[1]._id }]
      }
    ]);

    console.log('📝 Created sample posts');

    // Create Sample Events
    const events = await Event.create([
      {
        title: 'Startup Founders Networking Night',
        description: 'Join us for an exclusive evening of networking with successful entrepreneurs and investors. Great opportunity to make meaningful connections and share experiences.',
        organizer: users[0]._id,
        city: 'San Francisco',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        time: '18:00',
        maxAttendees: 50,
        image: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800',
        tags: ['networking', 'founders', 'investors'],
        category: 'networking',
        attendees: [
          { user: users[0]._id },
          { user: users[1]._id }
        ]
      },
      {
        title: 'AI in Startup Operations Workshop',
        description: 'Learn how to leverage AI tools to streamline your startup operations and scale efficiently. Hands-on workshop with real-world examples.',
        organizer: users[1]._id,
        city: 'New York',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        time: '14:00',
        maxAttendees: 40,
        image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
        tags: ['AI', 'operations', 'workshop'],
        category: 'workshop',
        attendees: [
          { user: users[1]._id },
          { user: users[2]._id }
        ]
      }
    ]);

    console.log('📅 Created sample events');

    // Create Sample Requests
    const requests = await Request.create([
      {
        author: users[3]._id,
        title: 'Looking for a Technical Co-Founder',
        content: 'We\'re building a sustainable energy platform and need a technical co-founder with experience in IoT and renewable energy systems. Seed funding secured, looking for someone passionate about climate tech.',
        category: 'co-founder',
        tags: ['co-founder', 'technical', 'greentech', 'iot'],
        urgency: 'high',
        location: { city: 'Seattle', remote: true },
        upvotes: [{ user: users[0]._id }, { user: users[1]._id }],
        replies: [
          {
            user: users[2]._id,
            content: 'This sounds like an exciting opportunity! I have experience in IoT systems. Would love to learn more.'
          }
        ]
      },
      {
        author: users[4]._id,
        title: 'Seeking Introductions to VCs in Fintech',
        content: 'We\'re raising our Series A and would love warm introductions to VCs who specialize in fintech, particularly in the B2B lending space. Happy to share our deck and metrics.',
        category: 'funding',
        tags: ['vc', 'fintech', 'introductions', 'seriesA'],
        urgency: 'medium',
        location: { city: 'Boston', remote: true },
        upvotes: [{ user: users[0]._id }]
      },
      {
        author: users[1]._id,
        title: 'Need Help with Go-to-Market Strategy',
        content: 'Looking for experienced founders who have successfully launched B2B SaaS products. Need advice on pricing strategy, customer acquisition, and sales process.',
        category: 'marketing',
        tags: ['gtm', 'saas', 'pricing', 'sales'],
        urgency: 'medium',
        location: { remote: true }
      }
    ]);

    console.log('❓ Created sample requests');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin users: 1`);
    console.log(`- Plans: ${plans.length}`);
    console.log(`- Perks: ${perks.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Posts: ${posts.length}`);
    console.log(`- Events: ${events.length}`);
    console.log(`- Requests: ${requests.length}`);
    console.log('\n🔐 Admin Login:');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('\n👤 Test User Login:');
    console.log(`Email: john@startup.com`);
    console.log(`Password: password123`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
seedData();