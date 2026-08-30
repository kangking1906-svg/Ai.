const { PermissionFlagsBits } = require('discord.js');

function isAdmin(member, ownerId) {
  if (!member) return false;
  if (member.id === ownerId) return true;
  return member.permissions.has(PermissionFlagsBits.Administrator);
}

function isModerator(member) {
  if (!member) return false;
  return (
    member.permissions.has(PermissionFlagsBits.ModerateMembers) ||
    member.permissions.has(PermissionFlagsBits.BanMembers) ||
    member.permissions.has(PermissionFlagsBits.KickMembers) ||
    member.permissions.has(PermissionFlagsBits.ManageMessages)
  );
}

function botHasPermission(channel, permission) {
  if (!channel || !channel.permissionsFor) return false;
  const botMember = channel.guild?.members?.me;
  if (!botMember) return false;
  return botMember.permissions.has(PermissionFlagsBits[permission]);
}

module.exports = {
  isAdmin,
  isModerator,
  botHasPermission
};
