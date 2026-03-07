import { prisma } from '../lib/prisma'

async function main() {
  await prisma.status.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Active' },
  })

  await prisma.status.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'Inactive' },
  })

  await prisma.status.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: 'Deleted' },
  })

  // Seed categories from design (Recommended topics)
  const categories = [
    { id: 1, name: 'Programming' },
    { id: 2, name: 'Data Science' },
    { id: 3, name: 'UX' },
    { id: 4, name: 'Startup' },
    { id: 5, name: 'Writing' },
    { id: 6, name: 'Psychology' },
  ]
  for (const { id, name } of categories) {
    await prisma.category.upsert({
      where: { id },
      update: { name },
      create: { id, name, statusId: 1 },
    })
  }

  // Seed demo user and articles for Feed (Step 1.3)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@medium.local' },
    update: {},
    create: {
      email: 'demo@medium.local',
      username: 'demoauthor',
      password: 'Pass@word123',
      name: 'Demo Author',
      statusId: 1,
    },
  })

  // Reset demo articles on re-seed
  await prisma.article.deleteMany({ where: { authorId: demoUser.id } })

  const articles = [
    {
      title: 'The Future of Human-Computer Interaction in 2025',
      content:
        '<p>As AI systems become more capable, the relationship between humans and computers is evolving in unexpected ways. This article explores the trends shaping our digital future.</p><p>From voice interfaces to ambient computing, we are moving toward a world where technology fades into the background.</p>',
    },
    {
      title: 'The Last Programmer — A Short Story About AI',
      content:
        '<p>Artificial intelligence is no longer a distant dream. It is here, and it is changing how we work, create, and connect.</p>',
    },
    {
      title: 'Building a Medium Clone with Next.js and Prisma',
      content:
        '<p>Learn how to build a blog platform similar to Medium using Next.js 16, Prisma, and Tailwind CSS. We will cover authentication, article CRUD, and a responsive feed layout.</p>',
    },
  ]

  for (const { title, content } of articles) {
    await prisma.article.create({
      data: { title, content, authorId: demoUser.id, statusId: 1 },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
