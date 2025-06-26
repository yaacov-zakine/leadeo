# 🚀 Leado - CRM de Gestion de Campagnes

**Leado** est une application CRM moderne pour la gestion de campagnes de prospection, développée avec Next.js 14, TypeScript, Supabase et Tailwind CSS.

## ✨ Fonctionnalités

### 🎯 Gestion de Campagnes

- **Création de campagnes** avec volume cible, zone géographique, secteur d'activité
- **Suivi des statuts** : À valider → En production → Terminée
- **Dashboard en temps réel** avec statistiques et progression
- **Gestion des prospects livrés** avec compteurs automatiques

### 👥 Espaces Utilisateurs

- **Interface Client** : Consultation des campagnes, suivi en temps réel
- **Interface Admin** : Gestion complète, validation, notes internes
- **Authentification sécurisée** avec rôles distincts

### 💬 Communication

- **Chat temps réel** entre admin et client par campagne
- **Partage de fichiers** avec upload/dowload sécurisé
- **Commentaires** persistants avec historique
- **Notifications** en temps réel

### 🎨 Interface Moderne

- **Design responsive** optimisé mobile/desktop
- **UI/UX professionnelle** style CRM moderne
- **Navigation intuitive** avec sidebar
- **Thème cohérent** avec palette harmonisée

## 🛠️ Technologies

- **Frontend** : Next.js 14, TypeScript, Tailwind CSS
- **Backend** : Supabase (PostgreSQL, Auth, Storage, Realtime)
- **UI Components** : Shadcn/ui
- **State Management** : React Query (TanStack Query)
- **Deployment** : Vercel

## 📦 Installation

### Prérequis

- Node.js 18+
- npm/yarn/pnpm
- Compte Supabase

### 1. Cloner le repository

```bash
git clone https://github.com/yaacov-zakine/leadeo.git
cd leado
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configuration Supabase

#### Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et la clé anon

#### Configuration de la base de données

Exécutez ce SQL dans l'éditeur SQL de Supabase :

```sql
-- Table des campagnes
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_volume INTEGER NOT NULL,
  zone TEXT NOT NULL,
  sector TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'À valider',
  prospects_generated INTEGER DEFAULT 0,
  admin_notes TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL, -- 'admin' ou 'client'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des fichiers
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  uploaded_by TEXT NOT NULL, -- 'admin' ou 'client'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commentaires
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_messages_campaign_id ON messages(campaign_id);
CREATE INDEX idx_files_campaign_id ON files(campaign_id);
CREATE INDEX idx_comments_campaign_id ON comments(campaign_id);
```

#### Configuration du Storage

1. Créez un bucket `campaign-files` dans Supabase Storage
2. Ajoutez une policy d'upload permissive :

```sql
-- Policy pour l'upload (à adapter selon vos besoins)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 4. Variables d'environnement

Créez un fichier `.env.local` :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# Admin (optionnel)
ADMIN_CODE=votre_code_admin_secret
```

### 5. Lancer l'application

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🚀 Utilisation

### Espace Client

1. **Connexion** : Utilisez votre email pour vous connecter
2. **Dashboard** : Consultez vos campagnes et statistiques
3. **Créer une campagne** : Remplissez le formulaire avec vos besoins
4. **Suivi** : Suivez l'avancement en temps réel
5. **Communication** : Échangez avec l'admin via le chat et les fichiers

### Espace Admin

1. **Connexion** : Utilisez le code admin configuré
2. **Dashboard** : Vue d'ensemble de toutes les campagnes
3. **Gestion** : Validez, modifiez les statuts, ajoutez des notes
4. **Communication** : Répondez aux clients, partagez des fichiers
5. **Suivi** : Gérez les prospects livrés et les délais

## 📱 Fonctionnalités Avancées

### Temps Réel

- **Chat instantané** entre admin et client
- **Notifications** de nouveaux messages/fichiers
- **Mise à jour automatique** des statuts

### Gestion des Fichiers

- **Upload sécurisé** vers Supabase Storage
- **Types de fichiers** : Tous formats acceptés
- **Organisation** par campagne
- **Téléchargement** direct

### Sécurité

- **Authentification** Supabase Auth
- **Rôles distincts** admin/client
- **Policies** PostgreSQL pour la sécurité des données
- **HTTPS** en production

## 🎨 Personnalisation

### Thème

Modifiez les variables CSS dans `app/globals.css` :

```css
:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-accent: #f59e0b;
  --color-success: #10b981;
  --color-danger: #ef4444;
  /* ... */
}
```

### Composants

L'application utilise Shadcn/ui pour les composants. Personnalisez dans `app/src/components/ui/`.

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Autres plateformes

L'application est compatible avec :

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :

- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

**Leado** - Simplifiez la gestion de vos campagnes de prospection ! 🎯
