import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // TODO: Vérifier que l'utilisateur est admin
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    // }

    const users = await prisma.user.findMany({
      include: {
        clientAccount: {
          include: {
            company: true,
            subscription: true
          }
        },
        accountManager: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        clientAccount: user.clientAccount,
        accountManager: user.accountManager
      }))
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, role, password, company, phone } = await request.json()

    // TODO: Vérifier que l'utilisateur est admin
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    // }

    if (!email || !firstName || !lastName || !role || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      )
    }

    // Créer l'utilisateur avec les enregistrements associés selon le rôle
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        role,
        password: await bcrypt.hash(password, 12),
        company,
        phone,
        // Créer AccountManager si le rôle est ACCOUNT_MANAGER
        ...(role === "ACCOUNT_MANAGER" && {
          accountManager: {
            create: {
              // Les champs AccountManager seront créés automatiquement
            }
          }
        }),
        // Créer ClientAccount si le rôle est CLIENT
        ...(role === "CLIENT" && {
          clientAccount: {
            create: {
              // Créer une entreprise temporaire si fournie
              ...(company && {
                company: {
                  create: {
                    name: company,
                    industry: "Non spécifié",
                    website: "",
                    teamSize: "1-10",
                    goals: "[]",
                    currentChallenges: ""
                  }
                }
              }),
              // Créer un abonnement d'essai
              subscription: {
                create: {
                  plan: "BASIC",
                  status: "TRIAL",
                  amount: 0,
                  currency: "EUR",
                  trialStart: new Date(),
                  trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
                  currentPeriodStart: new Date(),
                  currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                }
              }
            }
          }
        })
      },
      include: {
        accountManager: true,
        clientAccount: {
          include: {
            company: true,
            subscription: true
          }
        }
      }
    })

    console.log("Utilisateur créé avec succès:", { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      accountManager: user.accountManager,
      clientAccount: user.clientAccount
    })

    return NextResponse.json({
      message: "Utilisateur créé avec succès",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accountManager: user.accountManager,
        clientAccount: user.clientAccount
      }
    })

  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 