import type { MergeStrategy } from '../../config/types';
import type { BranchStatus, HostRule, VulnerabilityAlert } from '../../types';
import type { CommitFilesConfig, LongCommitSha } from '../../util/git/types';

type VulnerabilityKey = string;
type VulnerabilityRangeKey = string;
type VulnerabilityPatch = string;
export type AggregatedVulnerabilities = Record<
  VulnerabilityKey,
  Record<VulnerabilityRangeKey, VulnerabilityPatch | null>
>;

export interface PlatformParams {
  endpoint?: string;
  token?: string;
  username?: string;
  password?: string;
  gitAuthor?: string;
}

export interface PlatformResult {
  endpoint: string;
  renovateUsername?: string;
  token?: string;
  gitAuthor?: string;
  /*
   * return these only if _additional_ rules/hosts are required
   */
  hostRules?: HostRule[];
}

export interface RepoResult {
  defaultBranch: string;
  isFork: boolean;
  repoFingerprint: string;
}

export type GitUrlOption = 'default' | 'ssh' | 'endpoint';

export interface RepoParams {
  repository: string;
  endpoint?: string;
  gitUrl?: GitUrlOption;
  forkCreation?: boolean;
  forkOrg?: string;
  forkToken?: string;
  forkProcessing?: 'enabled' | 'disabled';
  renovateUsername?: string;
  cloneSubmodules?: boolean;
  cloneSubmodulesFilter?: string[];
  ignorePrAuthor?: boolean;
  bbUseDevelopmentBranch?: boolean;
  includeMirrors?: boolean;
}

export interface PrDebugData {
  createdInVer: string;
  updatedInVer: string;
  targetBranch: string;
  labels?: string[];
}

export interface PrBodyStruct {
  hash: string;
  rawConfigHash?: string;
  rebaseRequested?: boolean;
  debugData?: PrDebugData;
}

/**
 *
 */
export interface Pr {
  bodyStruct?: PrBodyStruct;
  sourceBranch: string;
  cannotMergeReason?: string; // for reflecting platform policies which may prevent merging
  createdAt?: string;
  closedAt?: string;
  hasAssignees?: boolean;
  labels?: string[];
  number: number;
  reviewers?: string[];
  sha?: LongCommitSha;
  sourceRepo?: string;
  state: string;
  targetBranch?: string;
  title: string;
  isDraft?: boolean;
}

/**
 * TODO: Proper typing
 */
export interface Issue {
  body?: string;
  number?: number;
  state?: string;
  title?: string;
}
export interface PlatformPrOptions {
  autoApprove?: boolean;
  automergeStrategy?: MergeStrategy;
  azureWorkItemId?: number;
  bbUseDefaultReviewers?: boolean;
  bbAutoResolvePrTasks?: boolean;
  gitLabIgnoreApprovals?: boolean;
  usePlatformAutomerge?: boolean;
  forkModeDisallowMaintainerEdits?: boolean;
}

export interface CreatePRConfig {
  sourceBranch: string;
  targetBranch: string;
  prTitle: string;
  prBody: string;
  labels?: string[] | null;
  platformPrOptions?: PlatformPrOptions;
  draftPR?: boolean;
  milestone?: number;
}
export interface UpdatePrConfig {
  number: number;
  platformPrOptions?: PlatformPrOptions;
  prTitle: string;
  prBody?: string;
  state?: 'open' | 'closed';
  targetBranch?: string;

  /**
   * This field allows for label management and is designed to
   * accommodate the different label update methods on various platforms.
   *
   * - For Gitea, labels are updated by replacing the entire labels array.
   * - In the case of GitHub and GitLab, specific endpoints exist
   *   for adding and removing labels.
   */
  labels?: string[] | null;

  /**
   * Specifies an array of labels to be added.
   * @see {@link labels}
   */
  addLabels?: string[] | null;

  /**
   * Specifies an array of labels to be removed.
   * @see {@link labels}
   */
  removeLabels?: string[] | null;
}
export interface ReattemptPlatformAutomergeConfig {
  number: number;
  platformPrOptions?: PlatformPrOptions;
}
export interface EnsureIssueConfig {
  title: string;
  reuseTitle?: string;
  body: string;
  labels?: string[];
  once?: boolean;
  shouldReOpen?: boolean;
  confidential?: boolean;
}
export interface BranchStatusConfig {
  branchName: string;
  context: string;
  description: string;
  state: BranchStatus;
  url?: string;
}
export interface FindPRConfig {
  branchName: string;
  prTitle?: string | null;
  state?: 'open' | 'closed' | '!open' | 'all';
  refreshCache?: boolean;
  targetBranch?: string | null;
  includeOtherAuthors?: boolean;
}
export interface MergePRConfig {
  branchName?: string;
  id: number;
  strategy?: MergeStrategy;
}
export interface EnsureCommentConfig {
  number: number;
  topic: string | null;
  content: string;
}

export interface EnsureCommentRemovalConfigByTopic {
  type: 'by-topic';
  number: number;
  topic: string;
}
export interface EnsureCommentRemovalConfigByContent {
  type: 'by-content';
  number: number;
  content: string;
}
export type EnsureCommentRemovalConfig =
  | EnsureCommentRemovalConfigByTopic
  | EnsureCommentRemovalConfigByContent;

export type EnsureIssueResult = 'updated' | 'created';

export type RepoSortMethod =
  | 'alpha'
  | 'created'
  | 'updated'
  | 'size'
  | 'id'
  | null;

export type SortMethod = 'asc' | 'desc' | null;
export interface AutodiscoverConfig {
  topics?: string[];
  sort?: RepoSortMethod;
  order?: SortMethod;
  includeMirrors?: boolean;
  namespaces?: string[];
  projects?: string[];
}

export interface FileOwnerRule {
  usernames: string[];
  pattern: string;
  score: number;
  match: (path: string) => boolean;
}

export interface Platform {
  findIssue(title: string): Promise<Issue | null>;
  getIssueList(): Promise<Issue[]>;
  getIssue?(number: number, memCache?: boolean): Promise<Issue | null>;
  getVulnerabilityAlerts?(): Promise<VulnerabilityAlert[]>;
  getRawFile(
    fileName: string,
    repoName?: string,
    branchOrTag?: string,
  ): Promise<string | null>;
  getJsonFile(
    fileName: string,
    repoName?: string,
    branchOrTag?: string,
  ): Promise<any>;
  initRepo(config: RepoParams): Promise<RepoResult>;
  getPrList(): Promise<Pr[]>;
  ensureIssueClosing(title: string): Promise<void>;
  ensureIssue(
    issueConfig: EnsureIssueConfig,
  ): Promise<EnsureIssueResult | null>;
  massageMarkdown(
    prBody: string,
    /**
     * Useful for suggesting the use of rebase label when there is no better
     * way, e.g. for Gerrit.
     */
    rebaseLabel?: string,
  ): string;
  updatePr(prConfig: UpdatePrConfig): Promise<void>;
  mergePr(config: MergePRConfig): Promise<boolean>;
  addReviewers(number: number, reviewers: string[]): Promise<void>;
  addAssignees(number: number, assignees: string[]): Promise<void>;
  createPr(prConfig: CreatePRConfig): Promise<Pr | null>;
  getRepos(config?: AutodiscoverConfig): Promise<string[]>;
  getBranchForceRebase?(branchName: string): Promise<boolean>;
  deleteLabel(number: number, label: string): Promise<void>;
  addLabel?(number: number, label: string): Promise<void>;
  setBranchStatus(branchStatusConfig: BranchStatusConfig): Promise<void>;
  getBranchStatusCheck(
    branchName: string,
    // TODO: can be undefined or null ? #22198
    context: string | null | undefined,
  ): Promise<BranchStatus | null>;
  ensureCommentRemoval(
    ensureCommentRemoval:
      | EnsureCommentRemovalConfigByTopic
      | EnsureCommentRemovalConfigByContent,
  ): Promise<void>;
  ensureComment(ensureComment: EnsureCommentConfig): Promise<boolean>;
  getPr(number: number): Promise<Pr | null>;
  findPr(findPRConfig: FindPRConfig): Promise<Pr | null>;
  refreshPr?(number: number): Promise<void>;
  reattemptPlatformAutomerge?(
    prConfig: ReattemptPlatformAutomergeConfig,
  ): Promise<void>;
  getBranchStatus(
    branchName: string,
    internalChecksAsSuccess: boolean,
  ): Promise<BranchStatus>;
  getBranchPr(branchName: string, targetBranch?: string): Promise<Pr | null>;
  tryReuseAutoclosedPr?(pr: Pr): Promise<Pr | null>;
  initPlatform(config: PlatformParams): Promise<PlatformResult>;
  filterUnavailableUsers?(users: string[]): Promise<string[]>;
  commitFiles?(config: CommitFilesConfig): Promise<LongCommitSha | null>;
  expandGroupMembers?(reviewersOrAssignees: string[]): Promise<string[]>;
  extractRulesFromCodeOwnersLines?(cleanedLines: string[]): FileOwnerRule[];

  maxBodyLength(): number;
  labelCharLimit?(): number;
}

export interface PlatformScm {
  isBranchBehindBase(branchName: string, baseBranch: string): Promise<boolean>;
  isBranchModified(branchName: string, baseBranch: string): Promise<boolean>;
  isBranchConflicted(baseBranch: string, branch: string): Promise<boolean>;
  branchExists(branchName: string): Promise<boolean>;
  getBranchCommit(branchName: string): Promise<LongCommitSha | null>;
  deleteBranch(branchName: string): Promise<void>;
  commitAndPush(commitConfig: CommitFilesConfig): Promise<LongCommitSha | null>;
  getFileList(): Promise<string[]>;
  checkoutBranch(branchName: string): Promise<LongCommitSha>;
  mergeToLocal(branchName: string): Promise<void>;
  mergeAndPush(branchName: string): Promise<void>;
  syncForkWithUpstream?(baseBranch: string): Promise<void>;
}
