import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Clear existing data
  await prisma.subscription.deleteMany()
  await prisma.plan.deleteMany()
  await prisma.event.deleteMany()
  
  // Create plans
  const basicPlan = await prisma.plan.create({
    data: {
      name: 'Basic',
      description: 'Perfect for individuals getting started',
      price: 999, // $9.99
      interval: 'month',
      features: JSON.stringify([
        '10 projects',
        'Basic analytics',
        'Email support'
      ])
    }
  })

  const proPlan = await prisma.plan.create({
    data: {
      name: 'Pro',
      description: 'For growing teams and businesses',
      price: 2999, // $29.99
      interval: 'month',
      features: JSON.stringify([
        'Unlimited projects',
        'Advanced analytics',
        'Priority support',
        'Team collaboration'
      ])
    }
  })

  const enterprisePlan = await prisma.plan.create({
    data: {
      name: 'Enterprise',
      description: 'Custom solution for large organizations',
      price: 9999, // $99.99
      interval: 'month',
      features: JSON.stringify([
        'Everything in Pro',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee'
      ])
    }
  })

  console.log('✅ Created plans:', { basicPlan: basicPlan.id, proPlan: proPlan.id, enterprisePlan: enterprisePlan.id })
  
  console.log('🌱 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })