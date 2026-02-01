
import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Users,
  User,
  Mail,
  Phone,
  MapPin,
  FolderPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Profile, ProfileGroup } from '../types';
import ProfileModal from '../components/ProfileModal';

const ProfilesView: React.FC = () => {
  const {
    profileGroups,
    addProfileGroup,
    updateProfileGroup,
    deleteProfileGroup,
    addProfile,
    updateProfile,
    deleteProfile
  } = useApp();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProfileGroup | null>(null);
  const [groupName, setGroupName] = useState('');

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setGroupName('');
    setIsGroupModalOpen(true);
  };

  const handleEditGroup = (group: ProfileGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = () => {
    if (!groupName.trim()) return;

    if (editingGroup) {
      updateProfileGroup(editingGroup.id, { name: groupName.trim() });
    } else {
      addProfileGroup(groupName.trim());
    }
    setIsGroupModalOpen(false);
    setGroupName('');
  };

  const handleDeleteGroup = (id: string) => {
    const group = profileGroups.find(g => g.id === id);
    const profileCount = group?.profiles.length || 0;
    const message = profileCount > 0
      ? `Are you sure you want to delete this group? This will also delete ${profileCount} profile${profileCount !== 1 ? 's' : ''}.`
      : 'Are you sure you want to delete this group?';

    if (confirm(message)) {
      deleteProfileGroup(id);
    }
  };

  const handleCreateProfile = (groupId: string) => {
    setActiveGroupId(groupId);
    setEditingProfile(null);
    setIsProfileModalOpen(true);
  };

  const handleEditProfile = (groupId: string, profile: Profile) => {
    setActiveGroupId(groupId);
    setEditingProfile(profile);
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (profileData: Omit<Profile, 'id'>) => {
    if (!activeGroupId) return;

    if (editingProfile) {
      updateProfile(activeGroupId, editingProfile.id, profileData);
    } else {
      addProfile(activeGroupId, profileData);
    }
  };

  const handleDeleteProfile = (groupId: string, profileId: string) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      deleteProfile(groupId, profileId);
    }
  };

  const totalProfiles = profileGroups.reduce((sum, g) => sum + g.profiles.length, 0);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profiles</h1>
          <p className="text-sm text-slate-500">
            Manage your shipping profiles for quick checkout.
            {profileGroups.length > 0 && (
              <span className="ml-2 text-slate-400">
                {profileGroups.length} group{profileGroups.length !== 1 ? 's' : ''}, {totalProfiles} profile{totalProfiles !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleCreateGroup}
          className="bg-accent-purple text-white px-6 py-2.5 rounded-xl text-xs font-bold glow-purple flex items-center gap-2"
        >
          <FolderPlus size={16} />
          New Group
        </button>
      </div>

      <div className="space-y-4">
        {profileGroups.map((group) => (
          <div key={group.id} className="glass-card rounded-2xl overflow-hidden hover:border-purple-500/20 transition-all">
            {/* Group Header */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-purple/10 rounded-xl flex items-center justify-center">
                    <Users size={24} className="accent-purple" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{group.name}</h3>
                    <p className="text-xs text-slate-500">
                      {group.profiles.length} profile{group.profiles.length !== 1 ? 's' : ''}
                      <span className="mx-2">•</span>
                      Created {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCreateProfile(group.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 hover:bg-white/5 text-xs font-bold transition-all"
                  >
                    <Plus size={14} className="accent-purple" />
                    Add Profile
                  </button>
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="p-2.5 bg-white/5 text-slate-400 rounded-xl hover:bg-white/10 transition-colors"
                    title="Edit Group"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                    title="Delete Group"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="w-[1px] h-8 bg-white/5 mx-2"></div>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="p-2 text-slate-500 hover:text-white transition-colors"
                  >
                    {expandedGroups.has(group.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Profiles */}
            {expandedGroups.has(group.id) && (
              <div className="border-t border-white/5 bg-white/[0.01]">
                {group.profiles.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {group.profiles.map((profile) => (
                      <div key={profile.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mt-1">
                              <User size={20} className="text-slate-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-base mb-2">{profile.name}</h4>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                  <Mail size={14} className="accent-purple" />
                                  <span>{profile.email}</span>
                                </div>
                                {profile.phone && (
                                  <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Phone size={14} className="accent-purple" />
                                    <span>{profile.phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                  <MapPin size={14} className="accent-purple" />
                                  <span>
                                    {profile.shipping.firstName} {profile.shipping.lastName}
                                    {profile.shipping.address1 && `, ${profile.shipping.address1}`}
                                    {profile.shipping.city && `, ${profile.shipping.city}`}
                                    {profile.shipping.country && ` (${profile.shipping.country})`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditProfile(group.id, profile)}
                              className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 transition-colors"
                              title="Edit Profile"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProfile(group.id, profile.id)}
                              className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                              title="Delete Profile"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User size={32} className="text-slate-600" />
                    </div>
                    <p className="text-slate-500 mb-4">No profiles in this group yet</p>
                    <button
                      onClick={() => handleCreateProfile(group.id)}
                      className="text-accent-purple text-sm font-bold hover:underline"
                    >
                      Add your first profile
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {profileGroups.length === 0 && (
          <div className="glass-card rounded-3xl p-20 flex flex-col items-center justify-center text-center border-dashed border-2">
            <div className="w-20 h-20 bg-accent-purple/5 rounded-full flex items-center justify-center mb-6">
              <Users size={40} className="accent-purple opacity-20" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No profile groups yet</h2>
            <p className="text-slate-500 max-w-sm mb-8">
              Create profile groups to organize your shipping addresses and checkout information.
            </p>
            <button
              onClick={handleCreateGroup}
              className="bg-accent-purple text-white px-8 py-3 rounded-xl font-bold glow-purple"
            >
              Create First Group
            </button>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        editProfile={editingProfile}
      />

      {/* Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0A0F] border border-white/10 rounded-3xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold">{editingGroup ? 'Edit Group' : 'New Group'}</h2>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <ChevronDown size={20} className="rotate-45" />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium mb-2">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Personal, Work, Family"
                className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveGroup();
                }}
              />
            </div>

            <div className="flex gap-3 p-6 border-t border-white/5">
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-white/5 text-sm font-bold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGroup}
                disabled={!groupName.trim()}
                className="flex-1 py-3 rounded-xl bg-accent-purple text-white text-sm font-bold glow-purple hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingGroup ? 'Save Changes' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilesView;
