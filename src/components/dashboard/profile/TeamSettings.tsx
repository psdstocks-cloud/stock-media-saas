'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Users, Plus, Mail, Trash2, Crown, User } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  pointsBalance: {
    currentPoints: number;
    totalPurchased: number;
    totalUsed: number;
  } | null;
}

export function TeamSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ['userTeams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Failed to fetch teams.');
      return res.json();
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to create team.');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Team created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['userTeams'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create team.', variant: 'destructive' });
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async ({ teamId, email }: { teamId: string; email: string }) => {
      const res = await fetch('/api/teams/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, email }),
      });
      if (!res.ok) throw new Error('Failed to invite member.');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Invitation sent successfully!' });
      setInviteEmail('');
      queryClient.invalidateQueries({ queryKey: ['userTeams'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to send invitation.', variant: 'destructive' });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const res = await fetch('/api/teams/invite', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, userId }),
      });
      if (!res.ok) throw new Error('Failed to remove member.');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Member removed successfully!' });
      queryClient.invalidateQueries({ queryKey: ['userTeams'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to remove member.', variant: 'destructive' });
    },
  });

  const handleInviteMember = (teamId: string) => {
    if (!inviteEmail.trim()) return;
    
    setIsInviting(true);
    inviteMemberMutation.mutate(
      { teamId, email: inviteEmail.trim() },
      { onSettled: () => setIsInviting(false) }
    );
  };

  const handleRemoveMember = (teamId: string, userId: string) => {
    removeMemberMutation.mutate({ teamId, userId });
  };

  if (isLoading) {
    return <LoadingSkeleton className="h-64" />;
  }

  if (!teams || teams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Your Team
          </CardTitle>
          <CardDescription>
            Create a team to share points and collaborate with your colleagues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Teams allow you to share points and download media together. Perfect for agencies and design teams.
            </p>
            <Button 
              onClick={() => createTeamMutation.mutate('My Team')}
              disabled={createTeamMutation.isPending}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {teams.map((team) => (
        <Card key={team.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {team.name}
                </CardTitle>
                <CardDescription>
                  {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Badge variant="outline">
                {team.pointsBalance?.currentPoints || 0} points
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Team Members */}
            <div>
              <h4 className="font-medium mb-3">Team Members</h4>
              <div className="space-y-2">
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        {member.role === 'ADMIN' || member.role === 'OWNER' ? (
                          <Crown className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      {member.role !== 'OWNER' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(team.id, member.user.id)}
                          disabled={removeMemberMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite New Member */}
            <div>
              <h4 className="font-medium mb-3">Invite New Member</h4>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleInviteMember(team.id)}
                  disabled={isInviting || !inviteEmail.trim()}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {isInviting ? 'Sending...' : 'Invite'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
